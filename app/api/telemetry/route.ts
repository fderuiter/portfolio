import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { Redis } from "@upstash/redis";
import { TelemetryEventSchema, RateLimitParamsSchema } from "@/lib/schemas";
import { Ratelimit } from "@upstash/ratelimit";
import * as Sentry from "@sentry/nextjs";

// Enforce standard dynamic route behavior in Next.js 16 to query live datastores safely
export const dynamic = "force-dynamic";

// Initialize the standard Redis client using process env
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "http://localhost:8079",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "example_token",
});

// Ephemeral/local memory cache Map for the SDK
const sdkEphemeralCache = new Map<string, number>();

// Parse the rate limit defaults from schema
const rateLimitConfig = RateLimitParamsSchema.parse({});
const RATE_LIMIT_WINDOW_S = rateLimitConfig.windowMs / 1000;
const MAX_REQUESTS_PER_WINDOW = rateLimitConfig.maxRequests;

// Standard library SDK Rate Limiter using Upstash Redis as shared state backend
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(MAX_REQUESTS_PER_WINDOW, `${RATE_LIMIT_WINDOW_S} s`),
  ephemeralCache: sdkEphemeralCache,
});

// Local cache to bypass remote calls for active, valid clients
interface LocalCacheEntry {
  count: number;
  expiresAt: number;
}
const activeClientsCache = new Map<string, LocalCacheEntry>();

interface RateLimitResult {
  limited: boolean;
  headers?: Record<string, string>;
}

/**
 * Anonymously rate limits client requests using hashed IP identifiers.
 * Prevents PII collection while offering robust client-side DoS mitigation.
 * Bypasses remote checks for active, valid clients using a local cache.
 */
async function isRateLimited(req: NextRequest): Promise<RateLimitResult> {
  // Extract client IP address from standard proxies or request socket
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  // Hash IP to establish anonymous tracking token (no plain text IP is logged or stored)
  const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

  const now = Date.now();

  // 1. Check local memory bypass cache for active, valid clients
  const cached = activeClientsCache.get(ipHash);
  if (cached && now < cached.expiresAt) {
    if (cached.count < MAX_REQUESTS_PER_WINDOW) {
      cached.count += 1;
      // Local cache hit: return no rate limiting immediately
      return {
        limited: false,
        headers: {
          "X-RateLimit-Limit": String(MAX_REQUESTS_PER_WINDOW),
          "X-RateLimit-Remaining": String(MAX_REQUESTS_PER_WINDOW - cached.count),
          "X-RateLimit-Reset": String(Math.ceil(cached.expiresAt / 1000)),
        },
      };
    }
  }

  // 2. Perform SDK-based rate check
  try {
    const result = await ratelimit.limit(ipHash);
    const headers = {
      "X-RateLimit-Limit": String(result.limit),
      "X-RateLimit-Remaining": String(result.remaining),
      "X-RateLimit-Reset": String(Math.ceil(result.reset / 1000)),
    };

    if (result.success) {
      // Valid client: update local bypass cache with a safe, short TTL (max 5 seconds or remaining window)
      activeClientsCache.set(ipHash, {
        count: MAX_REQUESTS_PER_WINDOW - result.remaining,
        expiresAt: Math.min(result.reset, now + 5000),
      });
      return { limited: false, headers };
    } else {
      // Blocked client: invalidate local bypass cache
      activeClientsCache.delete(ipHash);
      return { limited: true, headers };
    }
  } catch (err) {
    console.error("Rate limiting check failed, failing open:", err);
    return { limited: false };
  } finally {
    // Periodically sweep expired keys from local cache map to prevent memory leaks
    if (activeClientsCache.size > 5000) {
      for (const [key, val] of activeClientsCache.entries()) {
        if (Date.now() >= val.expiresAt) {
          activeClientsCache.delete(key);
        }
      }
    }
  }
}

export async function GET() {
  try {
    // Perform dynamic grouping aggregate on TelemetryEvents to sum view & click metrics
    const stats = await prisma.telemetryEvent.groupBy({
      by: ["projectSlug", "eventType"],
      _count: {
        id: true,
      },
    });

    // Format aggregate lists into a compact structured dictionary
    const formattedStats: Record<string, { views: number; clicks: number }> = {};

    for (const item of stats) {
      const slug = item.projectSlug;
      if (!formattedStats[slug]) {
        formattedStats[slug] = { views: 0, clicks: 0 };
      }

      if (item.eventType === "page_view") {
        formattedStats[slug].views = item._count.id;
      } else if (item.eventType === "project_click") {
        formattedStats[slug].clicks = item._count.id;
      }
    }

    // Set aggressive stale-while-revalidate headers to allow caching edge side
    return NextResponse.json(formattedStats, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=10, s-maxage=60, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Telemetry statistics aggregate query failed:", err);
    return NextResponse.json(
      { error: "Failed to compile aggregate portfolio telemetry" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Enforce rate limiter checks
    const rateLimitRes = await isRateLimited(req);
    if (rateLimitRes.limited) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down rate pacing." },
        {
          status: 429,
          headers: rateLimitRes.headers,
        }
      );
    }

    const payload = await req.json();
    const result = TelemetryEventSchema.safeParse(payload);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      let errorMessage = "Validation failed";
      if (firstIssue.path[0] === "projectSlug") {
        errorMessage = "Missing or invalid projectSlug identifier";
      } else if (firstIssue.path[0] === "eventType") {
        errorMessage = "Missing or invalid eventType. Allowed: 'page_view', 'project_click', 'route_error', 'contact_click', 'simulator_milestone'";
      }
      return NextResponse.json(
        {
          error: errorMessage,
          details: result.error.issues.map((err) => ({
            path: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const { projectSlug, eventType } = result.data;

    // Save transaction event to the PostgreSQL Neon datastore
    // Implement HA buffering: Timeout or fail on primary DB, fallback to Redis
    const eventId = crypto.randomUUID();
    const eventData = {
      id: eventId,
      projectSlug,
      eventType,
      createdAt: new Date(),
    };

    let newEvent;
    
    try {
      // Try writing to primary DB with 100ms timeout to ensure <150ms P95 latency
      newEvent = await Promise.race([
        prisma.telemetryEvent.create({
          data: eventData,
          select: {
            id: true,
            projectSlug: true,
            eventType: true,
            createdAt: true,
          },
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Database Write Timeout")), 100)
        )
      ]);
    } catch (dbErr) {
      console.warn("Primary DB write failed or timed out. Buffering to secondary store.", dbErr);
      
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL || "http://localhost:8079",
        token: process.env.UPSTASH_REDIS_REST_TOKEN || "example_token",
      });
      
      // Push event into Redis list for background synchronization and ensure TTL
      const p = redis.pipeline();
      p.lpush("telemetry_buffer", eventData);
      p.expire("telemetry_buffer", 48 * 60 * 60); // 48 hours
      const [listLength] = await p.exec();
      
      if (Number(listLength) > 1000) {
        console.error("ALERT: Secondary telemetry buffer occupancy exceeds threshold.");
      }
      
      newEvent = eventData;
    }

    const response = NextResponse.json({ success: true, event: newEvent }, { status: 201 });
    if (rateLimitRes.headers) {
      Object.entries(rateLimitRes.headers).forEach(([key, val]) => {
        response.headers.set(key, val);
      });
    }
    return response;
  } catch (err) {
    Sentry.captureException(err);
    console.error("Failed to commit telemetry event log:", err);
    return NextResponse.json(
      { error: "Failed to record telemetry interaction event" },
      { status: 500 }
    );
  }
}

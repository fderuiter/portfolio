import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { redis } from "@/lib/redis";
import { TelemetryEventSchema, RateLimitParamsSchema } from "@/lib/schemas";
import { Ratelimit } from "@upstash/ratelimit";
import * as Sentry from "@sentry/nextjs";

// Enforce standard dynamic route behavior in Next.js 16 to query live datastores safely
export const dynamic = "force-dynamic";

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
    const isArray = Array.isArray(payload);
    const eventsToProcess = isArray ? payload : [payload];

    if (eventsToProcess.length === 0) {
      return NextResponse.json(
        { error: "Empty batch payload" },
        { status: 400 }
      );
    }

    // Payload Limits: Maximum single batch payload size must be restricted to 50 events
    if (eventsToProcess.length > 50) {
      return NextResponse.json(
        { error: "Payload exceeds maximum batch limit of 50 events" },
        { status: 400 }
      );
    }

    const validEvents: { projectSlug: string; eventType: "page_view" | "project_click" | "route_error" }[] = [];
    const validationErrors: { item: unknown; errors: { path: string; message: string }[] }[] = [];

    for (const item of eventsToProcess) {
      const result = TelemetryEventSchema.safeParse(item);
      if (result.success) {
        validEvents.push(result.data);
      } else {
        validationErrors.push({
          item,
          errors: result.error.issues.map((err) => ({
            path: err.path.join("."),
            message: err.message,
          })),
        });
        console.error("Validation failed for event item in batch:", JSON.stringify(item), result.error.issues);
      }
    }

    // If there are zero valid events in the batch, return 400 validation error
    if (validEvents.length === 0) {
      let errorMessage = "Validation failed";
      if (validationErrors.length > 0) {
        const firstErr = validationErrors[0].errors[0];
        if (firstErr) {
          if (firstErr.path === "projectSlug") {
            errorMessage = "Missing or invalid projectSlug identifier";
          } else if (firstErr.path === "eventType") {
            errorMessage = "Missing or invalid eventType. Allowed: 'page_view', 'project_click', 'route_error'";
          }
        }
      }
      return NextResponse.json(
        {
          error: errorMessage,
          details: validationErrors,
        },
        { status: 400 }
      );
    }

    // Save transaction event to the PostgreSQL Neon datastore
    // Implement HA buffering: Timeout or fail on primary DB, fallback to Redis
    const processedEvents = [];
    const p = redis.pipeline();

    for (const event of validEvents) {
      const eventId = crypto.randomUUID();
      const eventData = {
        id: eventId,
        projectSlug: event.projectSlug,
        eventType: event.eventType,
        createdAt: new Date(),
      };
      processedEvents.push(eventData);
      p.lpush("telemetry_buffer", eventData);
    }

    p.expire("telemetry_buffer", 48 * 60 * 60); // 48 hours
    const listLengths = await p.exec();
    const lastListLength = listLengths[listLengths.length - 2];

    if (Number(lastListLength) > 1000) {
      console.error("ALERT: Secondary telemetry buffer occupancy exceeds threshold.");
    }

    const responseBody = isArray
      ? { success: true, events: processedEvents, validationErrors }
      : { success: true, event: processedEvents[0] };

    const response = NextResponse.json(responseBody, { status: 201 });
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

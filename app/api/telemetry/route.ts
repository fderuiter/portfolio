import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

// Enforce standard dynamic route behavior in Next.js 16 to query live datastores safely
export const dynamic = "force-dynamic";

// In-memory sliding window rate limiter cache: Maps hashed IP -> Array of timestamps (ms)
const rateLimitCache = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 60 seconds
const MAX_REQUESTS_PER_WINDOW = 100; // 100 requests per minute

/**
 * Anonymously rate limits client requests using hashed IP identifiers.
 * Prevents PII collection while offering robust client-side DoS mitigation.
 */
function isRateLimited(req: NextRequest): boolean {
  // Extract client IP address from standard proxies or request socket
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  // Hash IP to establish anonymous tracking token
  const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

  const now = Date.now();
  const requestTimes = rateLimitCache.get(ipHash) || [];

  // Filter timestamps to keep only those within the active sliding window
  const activeTimestamps = requestTimes.filter((time) => now - time < RATE_LIMIT_WINDOW_MS);

  if (activeTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  // Record active timestamp and sync cache map
  activeTimestamps.push(now);
  rateLimitCache.set(ipHash, activeTimestamps);

  // Periodically sweep expired keys from cache map to prevent memory leaks
  if (rateLimitCache.size > 5000) {
    const sweepThreshold = now - RATE_LIMIT_WINDOW_MS;
    for (const [key, times] of rateLimitCache.entries()) {
      const filtered = times.filter((t) => t > sweepThreshold);
      if (filtered.length === 0) {
        rateLimitCache.delete(key);
      } else {
        rateLimitCache.set(key, filtered);
      }
    }
  }

  return false;
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
    if (isRateLimited(req)) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down rate pacing." },
        { status: 429 }
      );
    }

    const payload = await req.json();
    const { projectSlug, eventType } = payload;

    // Validate payload values
    if (!projectSlug || typeof projectSlug !== "string") {
      return NextResponse.json({ error: "Missing or invalid projectSlug identifier" }, { status: 400 });
    }

    if (eventType !== "page_view" && eventType !== "project_click") {
      return NextResponse.json(
        { error: "Missing or invalid eventType. Allowed: 'page_view', 'project_click'" },
        { status: 400 }
      );
    }

    // Save transaction event to the PostgreSQL Neon datastore
    const newEvent = await prisma.telemetryEvent.create({
      data: {
        projectSlug,
        eventType,
      },
      select: {
        id: true,
        projectSlug: true,
        eventType: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, event: newEvent }, { status: 201 });
  } catch (err) {
    console.error("Failed to commit telemetry event log:", err);
    return NextResponse.json(
      { error: "Failed to record telemetry interaction event" },
      { status: 500 }
    );
  }
}

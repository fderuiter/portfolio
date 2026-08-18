import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";
import crypto from "crypto";

const defaultLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "60 s"),
  ephemeralCache: new Map(),
});

/**
 * Interface representing the result of a rate limit check.
 */
export interface RateLimitCheckResult {
  limited: boolean;
  response?: NextResponse;
}

/**
 * Enforces sliding-window rate limiting on incoming API requests.
 * Employs anonymized identity hashing (SHA-256) using client IP and User-Agent
 * to protect user privacy while preventing DoS traffic spikes.
 *
 * @param req - The incoming NextRequest object.
 * @param limiter - Optional custom Upstash Ratelimit instance.
 * @returns Object containing limited status and optional 429 response.
 */
export async function enforceRateLimit(
  req: NextRequest,
  limiter: Ratelimit = defaultLimiter
): Promise<RateLimitCheckResult> {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "";
  const connectionHash = crypto.createHash("sha256").update(`${ip}:${userAgent}`).digest("hex");

  try {
    const result = await limiter.limit(connectionHash);
    const headers = {
      "X-RateLimit-Limit": String(result.limit),
      "X-RateLimit-Remaining": String(result.remaining),
      "X-RateLimit-Reset": String(Math.ceil(result.reset / 1000)),
    };

    if (!result.success) {
      return {
        limited: true,
        response: NextResponse.json(
          { error: "Too many requests. Please slow down rate pacing." },
          { status: 429, headers }
        ),
      };
    }
  } catch (err) {
    console.error("Rate limiting check failed, failing open:", err);
  }

  return { limited: false };
}

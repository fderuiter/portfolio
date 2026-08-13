import { NextRequest, NextResponse } from "next/server";

/**
 * Validates that the required authorization secret is configured.
 * Designed to run during route initialization (fail-closed behavior).
 * If the validation secret is missing in staging or production (non-development) environments,
 * it immediately throws an error to prevent route initialization.
 */
export function validateRouteInitialization() {
  const isDev = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
  const isBuild = process.env.NEXT_PHASE === "phase-production-build";
  
  if (!isDev && !isBuild && !process.env.CRON_SECRET) {
    throw new Error("Route initialization failed: Required validation secret is missing.");
  }
}

/**
 * Validates the request credentials using the configured environment secret.
 * - In staging/production (non-development), if the secret is missing, it fails closed (rejects request).
 * - If the secret is set, it validates the request's Authorization header matching `Bearer <secret>`.
 * - In local development/test setups, requests are permitted without a secret if none is configured.
 */
export function validateSyncRequest(req: NextRequest): { isValid: boolean; errorResponse?: NextResponse } {
  const isDev = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
  const secret = process.env.CRON_SECRET;

  // Fail-closed: missing secret in non-development environment rejects all requests
  if (!isDev && !secret) {
    return {
      isValid: false,
      errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    };
  }

  // If secret is configured (regardless of environment), validate against it
  if (secret) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${secret}`) {
      return {
        isValid: false,
        errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      };
    }
  }

  // Permitted in local development/test when secret is not configured
  return { isValid: true };
}

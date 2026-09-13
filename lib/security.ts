import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "./env";

/**
 * Validates that the required authorization secret is configured.
 * Designed to run during route initialization (fail-closed behavior).
 * If the validation secret is missing in staging or production (non-development) environments,
 * it immediately throws an error to prevent route initialization.
 */
export function validateRouteInitialization() {
  const currentEnv = getEnv();
  const isDev =
    currentEnv.NODE_ENV === "development" || currentEnv.NODE_ENV === "test";
  // Next sets NEXT_PHASE itself while prerendering, and the e2e harness sets
  // PLAYWRIGHT_TEST, so both cover the cases where this module is imported
  // without a real secret. CI used to be listed here too, which disabled the
  // fail-closed guard for every job on every runner that exports CI=true --
  // the one environment where a regression in it would go unnoticed. CI now
  // supplies CRON_SECRET to the steps that boot a production server instead.
  const isBuild =
    currentEnv.NEXT_PHASE === "phase-production-build" ||
    currentEnv.PLAYWRIGHT_TEST === "true";

  if (!isDev && !isBuild && !currentEnv.CRON_SECRET) {
    throw new Error(
      "Route initialization failed: Required validation secret is missing."
    );
  }
}

/**
 * Validates the request credentials using the configured environment secret.
 * - In staging/production (non-development), if the secret is missing, it fails closed (rejects request).
 * - If the secret is set, it validates the request's Authorization header matching `Bearer <secret>`.
 * - In local development/test setups, requests are permitted without a secret if none is configured.
 */
export function validateSyncRequest(req: NextRequest): {
  isValid: boolean;
  errorResponse?: NextResponse;
} {
  const currentEnv = getEnv();
  const isDev =
    currentEnv.NODE_ENV === "development" || currentEnv.NODE_ENV === "test";
  const secret = currentEnv.CRON_SECRET;

  // Fail-closed: missing secret in non-development environment rejects all requests
  if (!isDev && !secret) {
    return {
      isValid: false,
      errorResponse: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  // If secret is configured (regardless of environment), validate against it
  if (secret) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${secret}`) {
      return {
        isValid: false,
        errorResponse: NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        ),
      };
    }
  }

  // Permitted in local development/test when secret is not configured
  return { isValid: true };
}

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getEnv, isBuildPhase } from "./env";

function timingSafeSecretMatch(provided: string, expected: string): boolean {
  const providedDigest = crypto.createHash("sha256").update(provided).digest();
  const expectedDigest = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(providedDigest, expectedDigest);
}

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
  // CI used to be treated as a build context here too, which disabled the
  // fail-closed guard for every job on every runner that exports CI=true --
  // the one environment where a regression in it would go unnoticed. CI now
  // supplies CRON_SECRET to the steps that boot a production server instead.
  const isBuild = isBuildPhase();

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
    const provided = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : "";
    if (!authHeader || !timingSafeSecretMatch(provided, secret)) {
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

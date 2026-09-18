import { getEnv } from "./env";

/**
 * Centralized helper resolving the canonical base URL of the application.
 *
 * The value is deterministic and never derived from the runtime browser origin, so
 * server-rendered markup and client-rendered markup always agree on site identity.
 * Resolution order:
 *
 * - In production (VERCEL_ENV="production" or NODE_ENV="production"), returns
 *   NEXT_PUBLIC_APP_URL when it is explicitly configured with a non-localhost domain,
 *   otherwise the canonical production domain (https://deruiter.dev).
 * - In non-production environments, returns NEXT_PUBLIC_APP_URL if provided, or falls
 *   back to a local address (http://localhost:3000).
 *
 * Callers that genuinely need the host the visitor is currently on — link sharing, for
 * example — must use getActiveHostUrl in lib/clipboard.ts instead.
 */
export function resolveBaseUrl(): string {
  let baseUrl = "";

  const currentEnv = getEnv();
  const envUrl = currentEnv.NEXT_PUBLIC_APP_URL;
  const isProd =
    currentEnv.VERCEL_ENV === "production" ||
    currentEnv.NODE_ENV === "production";

  if (isProd) {
    // In production, guard against errant localhost values and prioritize the canonical domain
    if (envUrl && envUrl.trim() !== "" && !envUrl.includes("localhost")) {
      baseUrl = envUrl.trim();
    } else {
      baseUrl = "https://deruiter.dev";
    }
  } else if (envUrl && envUrl.trim() !== "") {
    baseUrl = envUrl.trim();
  } else {
    baseUrl = "http://localhost:3000";
  }

  // Remove any trailing slash to ensure consistency
  return baseUrl.replace(/\/$/, "");
}

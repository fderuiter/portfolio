/**
 * Centered dynamic helper to synchronously resolve the base URL of the application.
 * Satisfies the following logic:
 * 1. Checks if a NEXT_PUBLIC_APP_URL environment variable is explicitly configured.
 * 2. If running in a browser environment, safely uses window.location.origin to maintain SSR and browser synchronization.
 * 3. Falls back gracefully to the production canonical domain (https://fderuiter.dev) in production.
 * 4. Falls back to a local address (http://localhost:3000) in development/preview if omitted.
 */
export function resolveBaseUrl(): string {
  let baseUrl = "";

  // 1. Browser environment check (with window and window.location checks)
  if (typeof window !== "undefined" && window.location && window.location.origin) {
    baseUrl = window.location.origin;
  } else {
    // 2. Client-safe environment variable check
    const envUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (envUrl && envUrl.trim() !== "") {
      baseUrl = envUrl.trim();
    } else {
      // 3. Environment-aware fallback
      const isProd = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
      if (isProd) {
        baseUrl = "https://fderuiter.dev";
      } else {
        baseUrl = "http://localhost:3000";
      }
    }
  }

  // Remove any trailing slash to ensure consistency
  return baseUrl.replace(/\/$/, "");
}

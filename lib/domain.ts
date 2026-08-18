import { getEnv } from "./env";

/**
 * Centered dynamic helper to synchronously resolve the base URL of the application.
 * Satisfies the following logic:
 * 1. If running in a browser environment, safely uses window.location.origin to maintain SSR and browser synchronization.
 * 2. In production (VERCEL_ENV="production" or NODE_ENV="production"), defaults strictly to the canonical domain (https://www.deruiter.dev), or uses NEXT_PUBLIC_APP_URL if explicitly configured with a non-localhost domain.
 * 3. In non-production environments, uses NEXT_PUBLIC_APP_URL if provided, or falls back to a local address (http://localhost:3000).
 */
export function resolveBaseUrl(): string {
  let baseUrl = "";

  // 1. Browser environment check (with window and window.location checks)
  if (typeof window !== "undefined" && window.location && window.location.origin) {
    baseUrl = window.location.origin;
  } else {
    // 2. Client-safe environment variable check
    const currentEnv = getEnv();
    const envUrl = currentEnv.NEXT_PUBLIC_APP_URL;
    const isProd = currentEnv.VERCEL_ENV === "production" || currentEnv.NODE_ENV === "production";

    if (isProd) {
      // In production, guard against errant localhost values and prioritize the canonical domain
      if (envUrl && envUrl.trim() !== "" && !envUrl.includes("localhost")) {
        baseUrl = envUrl.trim();
      } else {
        baseUrl = "https://www.deruiter.dev";
      }
    } else if (envUrl && envUrl.trim() !== "") {
      baseUrl = envUrl.trim();
    } else {
      baseUrl = "http://localhost:3000";
    }
  }

  // Remove any trailing slash to ensure consistency
  return baseUrl.replace(/\/$/, "");
}

/**
 * Constructs a fully qualified absolute canonical URL by combining the resolved base origin with a normalized route path.
 * Automatically resolves duplicate/multiple slashes to a single slash, normalizes leading/trailing path slashes,
 * and strips query parameters or hash fragments.
 */
export function constructCanonicalUrl(path?: string): string {
  const baseUrl = resolveBaseUrl();
  if (!path || path.trim() === "") {
    return `${baseUrl}/`;
  }

  let rawPath = path.trim();
  if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
    try {
      const parsed = new URL(rawPath);
      rawPath = parsed.pathname;
    } catch {
      // Fallback if URL parsing fails
    }
  }

  // Strip query parameters and hash fragments
  rawPath = rawPath.split("?")[0].split("#")[0];

  // Ensure leading slash and collapse multiple consecutive slashes into a single slash
  const cleanPath = ("/" + rawPath).replace(/\/+/g, "/");

  if (cleanPath === "/") {
    return `${baseUrl}/`;
  }

  // Strip trailing slash for subpaths
  const formattedPath = cleanPath.replace(/\/$/, "");
  return `${baseUrl}${formattedPath}`;
}


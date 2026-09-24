"use client";

import { useSyncExternalStore, useCallback } from "react";

/**
 * SSR-safe helper that checks whether a media query matches window.matchMedia.
 * Returns false if window is undefined or matchMedia is unsupported.
 */
export function getMatchMediaMatches(query: string): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  try {
    return window.matchMedia(query).matches;
  } catch {
    return false;
  }
}

/**
 * Hydration-safe React hook that subscribes to CSS media query changes.
 *
 * Uses `useSyncExternalStore` so the initial client render matches the server
 * render (false) before syncing with window.matchMedia.
 *
 * @param query - A valid CSS media query string (e.g. "(max-width: 767px)").
 * @returns True if the media query matches, false otherwise.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      if (typeof window === "undefined" || !window.matchMedia) {
        return () => {};
      }
      const mql = window.matchMedia(query);
      if (mql.addEventListener) {
        mql.addEventListener("change", callback);
        return () => mql.removeEventListener("change", callback);
      } else if (mql.addListener) {
        mql.addListener(callback);
        return () => mql.removeListener(callback);
      }
      return () => {};
    },
    [query]
  );

  const getSnapshot = useCallback(() => {
    return getMatchMediaMatches(query);
  }, [query]);

  const getServerSnapshot = useCallback(() => {
    return false;
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * React hook that returns whether the user has requested reduced motion in their OS settings.
 *
 * @returns True if `(prefers-reduced-motion: reduce)` matches.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

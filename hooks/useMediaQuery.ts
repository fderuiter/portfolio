"use client";

import { useSyncExternalStore } from "react";

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

interface QueryStore {
  subscribe: (callback: () => void) => () => void;
  getSnapshot: () => boolean;
  getServerSnapshot: () => boolean;
}

const storeCache = new Map<string, QueryStore>();

function getQueryStore(query: string, serverSnapshot = false): QueryStore {
  const cacheKey = `${query}:${serverSnapshot}`;
  let store = storeCache.get(cacheKey);
  if (!store) {
    const subscribe = (callback: () => void) => {
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
    };

    const getSnapshot = () => getMatchMediaMatches(query);
    const getServerSnapshot = () => serverSnapshot;

    store = { subscribe, getSnapshot, getServerSnapshot };
    storeCache.set(cacheKey, store);
  }
  return store;
}

/**
 * Hydration-safe React hook that subscribes to CSS media query changes.
 *
 * Uses `useSyncExternalStore` so the initial client render matches the server
 * render (false by default) before syncing with window.matchMedia.
 *
 * @param query - A valid CSS media query string (e.g. "(max-width: 767px)").
 * @param serverSnapshot - Optional initial value during server rendering (default: false).
 * @returns True if the media query matches, false otherwise.
 */
export function useMediaQuery(
  query: string,
  serverSnapshot = false
): boolean {
  const store = getQueryStore(query, serverSnapshot);
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );
}

/**
 * React hook that returns whether the user has requested reduced motion in their OS settings.
 *
 * @returns True if `(prefers-reduced-motion: reduce)` matches.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)", true);
}

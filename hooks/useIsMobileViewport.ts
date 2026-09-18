"use client";

import { useSyncExternalStore } from "react";

/** Viewport breakpoint below which AGENTS.md section 16 mobile budgets apply. */
export const MOBILE_VIEWPORT_QUERY = "(max-width: 767px)";

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mql = window.matchMedia(MOBILE_VIEWPORT_QUERY);
  mql.addEventListener?.("change", callback);
  return () => mql.removeEventListener?.("change", callback);
}

function getSnapshot(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(MOBILE_VIEWPORT_QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Hydration-safe read of whether the viewport is in the mobile band.
 *
 * Uses `useSyncExternalStore` rather than an effect-plus-flag so the first
 * client render already agrees with the server render (which always reports
 * desktop), per the hydration rules in AGENTS.md section 4.
 *
 * @returns True when the viewport matches `(max-width: 767px)`.
 */
export function useIsMobileViewport(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

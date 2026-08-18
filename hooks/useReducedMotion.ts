"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) {
    return () => {};
  }
  const mediaQueryList = window.matchMedia(QUERY);
  if (mediaQueryList.addEventListener) {
    mediaQueryList.addEventListener("change", onChange);
    return () => mediaQueryList.removeEventListener("change", onChange);
  } else {
    mediaQueryList.addListener(onChange);
    return () => mediaQueryList.removeListener(onChange);
  }
}

function getSnapshot(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * SSR-safe hook to detect if the user has enabled reduced motion preferences.
 * Evaluates preferences on the client after mount without triggering hydration mismatches.
 *
 * @returns Boolean indicating whether reduced motion is preferred.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

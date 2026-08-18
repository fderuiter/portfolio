"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

type LegacyMediaQueryList = MediaQueryList & {
  addListener?: (callback: (e: MediaQueryListEvent) => void) => void;
  removeListener?: (callback: (e: MediaQueryListEvent) => void) => void;
};

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const mediaQuery = window.matchMedia(QUERY) as LegacyMediaQueryList;
  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", callback);
    return () => mediaQuery.removeEventListener("change", callback);
  } else if (typeof mediaQuery.addListener === "function") {
    mediaQuery.addListener(callback);
    return () => mediaQuery.removeListener?.(callback);
  }
  return () => {};
}

function getSnapshot(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  try {
    return window.matchMedia(QUERY).matches;
  } catch {
    return false;
  }
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Checks whether user has requested reduced motion in their OS or browser settings.
 * Safe for execution in SSR, Node.js, and browser environments.
 */
export function isReducedMotionPreferred(): boolean {
  return getSnapshot();
}

/**
 * Centralized custom hook that reactively detects system prefers-reduced-motion changes.
 * Shares real-time state across declarative components, imperative scripts, and canvas render loops.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Shared motion accessibility hook exposing real-time system reduced motion state.
 */
export function useMotion(): { prefersReducedMotion: boolean } {
  const prefersReducedMotion = useReducedMotion();
  return { prefersReducedMotion };
}

"use client";

import { useMediaQuery } from "@/hooks/useMediaQuery";

/** Viewport breakpoint below which AGENTS.md section 16 mobile budgets apply. */
export const MOBILE_VIEWPORT_QUERY = "(max-width: 767px)";

/**
 * Hydration-safe read of whether the viewport is in the mobile band.
 *
 * Uses `useMediaQuery` so the first client render agrees with the server render
 * (which always reports desktop), per the hydration rules in AGENTS.md section 4.
 *
 * @returns True when the viewport matches `(max-width: 767px)`.
 */
export function useIsMobileViewport(): boolean {
  return useMediaQuery(MOBILE_VIEWPORT_QUERY);
}

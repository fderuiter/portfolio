"use client";

import { useNavigation, formatRouteLabel, isSamePageAnchor, type NavigationContextType } from "@/components/providers/NavigationProvider";

export { formatRouteLabel, isSamePageAnchor, type NavigationContextType };

/**
  Hook exposing interactive router transition, prefetch methods, and active navigation state.
 */
export function useRouterTransition() {
  return useNavigation();
}

"use client";

import React, { createContext, useContext, useMemo } from "react";
import { MotionConfig } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export interface MotionContextType {
  prefersReducedMotion: boolean;
}

const MotionContext = createContext<MotionContextType>({
  prefersReducedMotion: false,
});

/**
 * Hook to access the centralized motion context state.
 */
export function useMotionContext(): MotionContextType {
  return useContext(MotionContext);
}

/**
 * Global Motion Configuration Provider.
 * Configures Framer Motion across all subtrees and provides real-time motion preference state.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion();

  const contextValue = useMemo(
    () => ({ prefersReducedMotion }),
    [prefersReducedMotion]
  );

  return (
    <MotionContext.Provider value={contextValue}>
      <MotionConfig reducedMotion={prefersReducedMotion ? "always" : "user"}>
        {children}
      </MotionConfig>
    </MotionContext.Provider>
  );
}

"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useAnnouncer } from "./A11yProvider";

export type TerminologyLevel = "standard" | "simplified";

interface TranslationContextType {
  terminologyLevel: TerminologyLevel;
  setTerminologyLevel: (level: TerminologyLevel) => void;
  toggleTerminologyLevel: () => void;
}

const TranslationContext = createContext<TranslationContextType | null>(null);

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [terminologyLevel, setTerminologyLevel] = usePersistentState<TerminologyLevel>(
    "terminologyLevel",
    "standard"
  );
  const { announce } = useAnnouncer();
  const isFirstRender = useRef(true);

  // Announce change to screen readers
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const msg =
      terminologyLevel === "simplified"
        ? "Terminology level set to simplified, focusing on business impact."
        : "Terminology level set to standard engineering terms.";
    announce(msg, "polite");
  }, [terminologyLevel, announce]);

  const toggleTerminologyLevel = React.useCallback(() => {
    setTerminologyLevel((prev) => (prev === "standard" ? "simplified" : "standard"));
  }, [setTerminologyLevel]);

  const value = React.useMemo(
    () => ({
      terminologyLevel,
      setTerminologyLevel,
      toggleTerminologyLevel,
    }),
    [terminologyLevel, setTerminologyLevel, toggleTerminologyLevel]
  );

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
}

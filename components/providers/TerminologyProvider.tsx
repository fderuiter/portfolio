"use client";

import React, { createContext, useContext } from "react";
import { usePersistentState } from "@/hooks/usePersistentState";

interface TerminologyContextType {
  simplified: boolean;
  setSimplified: React.Dispatch<React.SetStateAction<boolean>>;
  isFallback?: boolean;
}

const TerminologyContext = createContext<TerminologyContextType | undefined>(undefined);

export const TerminologyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [simplified, setSimplified] = usePersistentState("simplified-terminology", false);

  return (
    <TerminologyContext.Provider value={{ simplified, setSimplified }}>
      {children}
    </TerminologyContext.Provider>
  );
};

export const useTerminology = () => {
  const context = useContext(TerminologyContext);
  if (!context) {
    // Return safe fallback values if called outside of the provider (e.g. in standalone unit tests)
    let initialSimplified = false;
    if (typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem("simplified-terminology");
        if (stored !== null) {
          initialSimplified = JSON.parse(stored) === true;
        }
      } catch {
        // ignore parse error
      }
    }
    return {
      simplified: initialSimplified,
      setSimplified: () => {},
      isFallback: true,
    };
  }
  return context;
};

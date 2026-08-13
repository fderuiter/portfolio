"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type NarrativeMode = "recruiter" | "developer";

interface NarrativeContextType {
  narrativeMode: NarrativeMode;
  setNarrativeMode: (mode: NarrativeMode) => void;
  toggleNarrativeMode: () => void;
}

const NarrativeContext = createContext<NarrativeContextType | undefined>(undefined);

export function NarrativeProvider({ children }: { children: React.ReactNode }) {
  const [narrativeMode, setNarrativeModeState] = useState<NarrativeMode>("recruiter");

  useEffect(() => {
    try {
      const savedMode = localStorage.getItem("narrativeMode") as NarrativeMode;
      if (savedMode === "recruiter" || savedMode === "developer") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setNarrativeModeState(savedMode);
      }
    } catch {
      // Quietly fail when localStorage is inaccessible (e.g. during SSR)
    }
  }, []);

  const setNarrativeMode = (mode: NarrativeMode) => {
    setNarrativeModeState(mode);
    try {
      localStorage.setItem("narrativeMode", mode);
    } catch {
      // Quietly fail
    }
  };

  const toggleNarrativeMode = () => {
    const nextMode = narrativeMode === "recruiter" ? "developer" : "recruiter";
    setNarrativeMode(nextMode);
  };

  return (
    <NarrativeContext.Provider value={{ narrativeMode, setNarrativeMode, toggleNarrativeMode }}>
      {children}
    </NarrativeContext.Provider>
  );
}

export function useNarrative() {
  const context = useContext(NarrativeContext);
  if (context === undefined) {
    throw new Error("useNarrative must be used within a NarrativeProvider");
  }
  return context;
}

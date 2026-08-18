"use client";

import React, { createContext, useContext, useMemo, useCallback } from "react";
import { usePersistentState } from "@/hooks/usePersistentState";

type PersonaType = "recruiter" | "technical";

interface PersonaContextType {
  persona: PersonaType;
  setPersona: (persona: PersonaType) => void;
}

const PersonaContext = createContext<PersonaContextType | null>(null);

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const [rawPersona, setPersonaState] = usePersistentState<PersonaType | string>(
    "global-persona",
    "recruiter"
  );
  const persona: PersonaType = rawPersona === "technical" ? "technical" : "recruiter";

  const setPersona = useCallback(
    (newPersona: PersonaType) => {
      setPersonaState(newPersona);
    },
    [setPersonaState]
  );

  const value = useMemo(
    () => ({
      persona,
      setPersona,
    }),
    [persona, setPersona]
  );

  return (
    <PersonaContext.Provider value={value}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  const context = useContext(PersonaContext);
  if (!context) {
    let saved: PersonaType | null = null;
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("global-persona");
        if (stored === "technical" || stored === "recruiter") {
          saved = stored;
        }
      } catch {
        // ignore storage read failure
      }
    }
    return {
      persona: (saved ?? "recruiter") as PersonaType,
      setPersona: () => {},
    };
  }
  return context;
}

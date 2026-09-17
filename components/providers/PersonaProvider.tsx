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
  const [persona, setPersistentPersona] = usePersistentState<PersonaType>(
    "global-persona",
    "recruiter"
  );

  const setPersona = useCallback(
    (newPersona: PersonaType) => {
      let scrollY = 0;
      if (typeof window !== "undefined") {
        scrollY = window.scrollY;
      }
      setPersistentPersona(newPersona);
      if (
        typeof window !== "undefined" &&
        typeof window.scrollTo === "function"
      ) {
        requestAnimationFrame(() => {
          try {
            window.scrollTo({ top: scrollY, behavior: "instant" });
          } catch {
            // ignore JSDOM unsupported scrollTo
          }
        });
      }
    },
    [setPersistentPersona]
  );

  const value = useMemo(
    () => ({
      persona:
        persona === "technical" || persona === "recruiter"
          ? persona
          : "recruiter",
      setPersona,
    }),
    [persona, setPersona]
  );

  return (
    <PersonaContext.Provider value={value}>{children}</PersonaContext.Provider>
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

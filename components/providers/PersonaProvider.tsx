"use client";

import React, { createContext, useContext, useState, useMemo, useEffect } from "react";

type PersonaType = "recruiter" | "technical";

interface PersonaContextType {
  persona: PersonaType;
  setPersona: (persona: PersonaType) => void;
}

const PersonaContext = createContext<PersonaContextType | null>(null);

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const [persona, setPersonaState] = useState<PersonaType>("recruiter");

  // Hydrate from localStorage on client mount to persist choice across navigation/refreshes
  useEffect(() => {
    try {
      const saved = localStorage.getItem("global-persona");
      if (saved === "technical" || saved === "recruiter") {
        setTimeout(() => {
          setPersonaState(saved);
        }, 0);
      }
    } catch (e) {
      console.error("Failed to load global-persona from localStorage", e);
    }
  }, []);

  const setPersona = (newPersona: PersonaType) => {
    setPersonaState(newPersona);
    try {
      localStorage.setItem("global-persona", newPersona);
    } catch (e) {
      console.error("Failed to save global-persona to localStorage", e);
    }
  };

  const value = useMemo(
    () => ({
      persona,
      setPersona,
    }),
    [persona]
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

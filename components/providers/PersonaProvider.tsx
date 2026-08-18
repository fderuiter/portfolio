"use client";

import React, { createContext, useContext, useMemo, useCallback, useSyncExternalStore } from "react";

type PersonaType = "recruiter" | "technical";

interface PersonaContextType {
  persona: PersonaType;
  setPersona: (persona: PersonaType) => void;
}

const PersonaContext = createContext<PersonaContextType | null>(null);

const PERSONA_LISTENERS = new Set<() => void>();

function notifyPersonaChange() {
  PERSONA_LISTENERS.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "global-persona") {
      notifyPersonaChange();
    }
  });
  window.addEventListener("portfolio-persona-change", notifyPersonaChange);
}

function subscribePersona(callback: () => void) {
  PERSONA_LISTENERS.add(callback);
  return () => {
    PERSONA_LISTENERS.delete(callback);
  };
}

function getPersonaSnapshot(): PersonaType {
  if (typeof window === "undefined") {
    return "recruiter";
  }
  try {
    if (typeof window.localStorage?.getItem === "function") {
      const saved = window.localStorage.getItem("global-persona");
      if (saved === "technical" || saved === "recruiter") {
        return saved;
      }
    }
  } catch {
    // fallback to recruiter
  }
  return "recruiter";
}

function getPersonaServerSnapshot(): PersonaType {
  return "recruiter";
}

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const persona = useSyncExternalStore(subscribePersona, getPersonaSnapshot, getPersonaServerSnapshot);

  const setPersona = useCallback((newPersona: PersonaType) => {
    try {
      if (typeof window !== "undefined" && typeof window.localStorage?.setItem === "function") {
        window.localStorage.setItem("global-persona", newPersona);
        window.dispatchEvent(new CustomEvent("portfolio-persona-change"));
      }
    } catch (e) {
      console.error("Failed to save global-persona to localStorage", e);
    }
    notifyPersonaChange();
  }, []);

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
    if (typeof window !== "undefined" && typeof window.localStorage?.getItem === "function") {
      try {
        const stored = window.localStorage.getItem("global-persona");
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

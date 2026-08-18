"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { clearGraphicsEngineCaches } from "@/lib/graphics-engine";

export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "portfolio-theme";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme): "light" | "dark" {
  const resolved = theme === "system" ? getSystemTheme() : theme;
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", resolved);
    // Clear canvas measurement caches synchronously when theme changes
    clearGraphicsEngineCaches();
    // Dispatch custom event for canvas recalculations
    window.dispatchEvent(new CustomEvent("theme-change", { detail: { theme, resolved } }));
  }
  return resolved;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (saved === "light" || saved === "dark" || saved === "system") {
        return saved;
      }
    } catch {}
    return "system";
  });

  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(() => getSystemTheme());

  const resolvedTheme: "light" | "dark" = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    applyTheme(theme);
  }, [theme, systemTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {}
  }, []);

  // Listen to OS system theme changes
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      setSystemTheme(mediaQuery.matches ? "dark" : "light");
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      const legacyQuery = mediaQuery as unknown as {
        addListener?: (fn: () => void) => void;
        removeListener?: (fn: () => void) => void;
      };
      if (typeof legacyQuery.addListener === "function") {
        legacyQuery.addListener(handleChange);
        return () => legacyQuery.removeListener?.(handleChange);
      }
    }
  }, []);

  // Listen to cross-tab storage changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const newTheme = (e.newValue as Theme | null) || "system";
        if (newTheme === "light" || newTheme === "dark" || newTheme === "system") {
          setThemeState(newTheme);
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

const defaultThemeContext: ThemeContextType = {
  theme: "system",
  setTheme: () => {},
  resolvedTheme: "dark",
};

export function useTheme() {
  const context = useContext(ThemeContext);
  return context || defaultThemeContext;
}

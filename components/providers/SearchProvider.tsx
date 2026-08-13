"use client";

import React, { createContext, useContext, useState } from "react";

interface SearchContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  openSearch: () => void;
  closeSearch: () => void;
}

const SearchContext = createContext<SearchContextType | null>(null);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openSearch = () => setIsOpen(true);
  const closeSearch = () => setIsOpen(false);

  React.useEffect(() => {
    const isWithinBoundary = (target: EventTarget | null) => {
      if (target instanceof Element) {
        return !!target.closest("[data-keyboard-boundary]");
      }
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isWithinBoundary(e.target)) {
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const value = React.useMemo(
    () => ({
      isOpen,
      setIsOpen,
      openSearch,
      closeSearch,
    }),
    [isOpen]
  );

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}

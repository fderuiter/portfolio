"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";

interface SearchContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  openSearch: () => void;
  closeSearch: () => void;
}

const SearchContext = createContext<SearchContextType | null>(null);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openSearch = useCallback(() => setIsOpen(true), []);
  const closeSearch = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({
      isOpen,
      setIsOpen,
      openSearch,
      closeSearch,
    }),
    [isOpen, openSearch, closeSearch]
  );

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__openSearch = () => setIsOpen(true);

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.closest?.("[data-keyboard-boundary]"))
      ) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).__openSearch;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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

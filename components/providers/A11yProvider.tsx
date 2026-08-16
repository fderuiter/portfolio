"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useConsoleArt } from "@/hooks/useConsoleArt";

export type Priority = "polite" | "assertive";

export interface AnnouncerContextType {
  announce: (message: string, priority?: Priority) => void;
}

const AnnouncerContext = createContext<AnnouncerContextType | null>(null);

export function useAnnouncer() {
  const ctx = useContext(AnnouncerContext);
  if (!ctx) {
    return {
      announce: (_message: string, _priority?: Priority) => {
        // Fallback fallback announcer to prevent crashing in direct component mounts/tests
      },
    };
  }
  return ctx;
}

export function A11yProvider({ children }: { children: React.ReactNode }) {
  useConsoleArt();
  const [politeQueue, setPoliteQueue] = useState<string[]>([]);
  const [assertiveQueue, setAssertiveQueue] = useState<string[]>([]);
  
  const [politeMessage, setPoliteMessage] = useState("");
  const [assertiveMessage, setAssertiveMessage] = useState("");

  const announce = useCallback((message: string, priority: Priority = "polite") => {
    // Announcements must be strictly filtered to prevent SPI (Sensitive Personal Information)
    const filteredMessage = message.replace(/\b\d{3}-\d{2}-\d{4}\b/g, "***-**-****");
    
    if (priority === "assertive") {
      setAssertiveQueue(q => [...q, filteredMessage]);
    } else {
      setPoliteQueue(q => [...q, filteredMessage]);
    }
  }, []);

  useEffect(() => {
    // Process assertive queue first (higher priority)
    if (assertiveQueue.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAssertiveMessage(assertiveQueue[0]);
      const timer = setTimeout(() => {
        setAssertiveMessage("");
        setAssertiveQueue(q => q.slice(1));
      }, 3000);
      return () => clearTimeout(timer);
    } else if (politeQueue.length > 0) {
      // Process polite queue if assertive is empty
       
      setPoliteMessage(politeQueue[0]);
      const timer = setTimeout(() => {
        setPoliteMessage("");
        setPoliteQueue(q => q.slice(1));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [politeQueue, assertiveQueue]);

  const contextValue = React.useMemo(() => ({ announce }), [announce]);

  return (
    <AnnouncerContext.Provider value={contextValue}>
      {children}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {politeMessage}
      </div>
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {assertiveMessage}
      </div>
    </AnnouncerContext.Provider>
  );
}

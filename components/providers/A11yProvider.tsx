"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

type Priority = "polite" | "assertive";

interface AnnouncerContextType {
  announce: (message: string, priority?: Priority) => void;
}

const AnnouncerContext = createContext<AnnouncerContextType | null>(null);

export function useAnnouncer() {
  const ctx = useContext(AnnouncerContext);
  if (!ctx) {
    throw new Error("useAnnouncer must be used within A11yProvider");
  }
  return ctx;
}

export function A11yProvider({ children }: { children: React.ReactNode }) {
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

  return (
    <AnnouncerContext.Provider value={{ announce }}>
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

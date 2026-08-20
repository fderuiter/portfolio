"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
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
        // Fallback announcer to prevent crashing in direct component mounts/tests
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

  const activePoliteTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeAssertiveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isPoliteActiveRef = useRef<boolean>(false);
  const isAssertiveActiveRef = useRef<boolean>(false);

  const announce = useCallback((message: string, priority: Priority = "polite") => {
    // Announcements must be strictly filtered to prevent SPI (Sensitive Personal Information)
    const filteredMessage = message.replace(/\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g, "***-**-****");
    
    if (priority === "assertive") {
      setAssertiveQueue(q => [...q, filteredMessage]);
    } else {
      setPoliteQueue(q => [...q, filteredMessage]);
    }
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (activePoliteTimerRef.current) {
        clearTimeout(activePoliteTimerRef.current);
      }
      if (activeAssertiveTimerRef.current) {
        clearTimeout(activeAssertiveTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Process assertive queue first (higher priority)
    if (assertiveQueue.length > 0) {
      if (!isAssertiveActiveRef.current) {
        // Preempt/interrupt active polite announcement if running
        if (isPoliteActiveRef.current) {
          if (activePoliteTimerRef.current) {
            clearTimeout(activePoliteTimerRef.current);
            activePoliteTimerRef.current = null;
          }
          isPoliteActiveRef.current = false;
          setPoliteMessage("");
        }

        isAssertiveActiveRef.current = true;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAssertiveMessage(assertiveQueue[0]);

        activeAssertiveTimerRef.current = setTimeout(() => {
          activeAssertiveTimerRef.current = null;
          isAssertiveActiveRef.current = false;
          setAssertiveMessage("");
          setAssertiveQueue(q => q.slice(1));
        }, 3000);
      }
      return;
    }

    // Process polite queue if assertive queue is empty
    if (politeQueue.length > 0) {
      if (!isPoliteActiveRef.current) {
        isPoliteActiveRef.current = true;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPoliteMessage(politeQueue[0]);

        activePoliteTimerRef.current = setTimeout(() => {
          activePoliteTimerRef.current = null;
          isPoliteActiveRef.current = false;
          setPoliteMessage("");
          setPoliteQueue(q => q.slice(1));
        }, 3000);
      }
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

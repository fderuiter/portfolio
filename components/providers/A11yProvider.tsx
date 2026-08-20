"use client";

import React, { createContext, useContext, useReducer, useCallback, useEffect, useMemo } from "react";
import { useConsoleArt } from "@/hooks/useConsoleArt";

export type Priority = "polite" | "assertive";

export interface AnnounceItem {
  id: string;
  text: string;
  priority: Priority;
}

export interface AnnouncerState {
  activePolite: AnnounceItem | null;
  activeAssertive: AnnounceItem | null;
  politeQueue: AnnounceItem[];
  assertiveQueue: AnnounceItem[];
}

type AnnouncerAction =
  | { type: "ANNOUNCE"; item: AnnounceItem }
  | { type: "TIMER_EXPIRED" };

export interface AnnouncerContextType {
  announce: (message: string, priority?: Priority) => void;
}

export const initialAnnouncerState: AnnouncerState = {
  activePolite: null,
  activeAssertive: null,
  politeQueue: [],
  assertiveQueue: [],
};

export function announcerReducer(state: AnnouncerState, action: AnnouncerAction): AnnouncerState {
  switch (action.type) {
    case "ANNOUNCE": {
      const { item } = action;
      if (item.priority === "assertive") {
        if (state.activeAssertive === null) {
          return {
            ...state,
            activePolite: null,
            activeAssertive: item,
          };
        }
        return {
          ...state,
          activePolite: null,
          assertiveQueue: [...state.assertiveQueue, item],
        };
      } else {
        if (state.activeAssertive === null && state.activePolite === null) {
          return {
            ...state,
            activePolite: item,
          };
        }
        return {
          ...state,
          politeQueue: [...state.politeQueue, item],
        };
      }
    }
    case "TIMER_EXPIRED": {
      if (state.activeAssertive !== null) {
        if (state.assertiveQueue.length > 0) {
          return {
            ...state,
            activeAssertive: state.assertiveQueue[0],
            assertiveQueue: state.assertiveQueue.slice(1),
            activePolite: null,
          };
        }
        if (state.politeQueue.length > 0) {
          return {
            ...state,
            activeAssertive: null,
            activePolite: state.politeQueue[0],
            politeQueue: state.politeQueue.slice(1),
          };
        }
        return {
          ...state,
          activeAssertive: null,
          activePolite: null,
        };
      }

      if (state.activePolite !== null) {
        if (state.assertiveQueue.length > 0) {
          return {
            ...state,
            activePolite: null,
            activeAssertive: state.assertiveQueue[0],
            assertiveQueue: state.assertiveQueue.slice(1),
          };
        }
        if (state.politeQueue.length > 0) {
          return {
            ...state,
            activePolite: state.politeQueue[0],
            politeQueue: state.politeQueue.slice(1),
          };
        }
        return {
          ...state,
          activePolite: null,
          activeAssertive: null,
        };
      }

      return state;
    }
    default:
      return state;
  }
}

let nextAnnounceId = 0;
function generateAnnounceId(): string {
  return `announcement-${++nextAnnounceId}-${Math.random().toString(36).substring(2, 9)}`;
}

const AnnouncerContext = createContext<AnnouncerContextType | null>(null);

const fallbackAnnouncer: AnnouncerContextType = {
  announce: (_message: string, _priority?: Priority) => {
    // Fallback announcer to prevent crashing in direct component mounts/tests
  },
};

export function useAnnouncer(): AnnouncerContextType {
  const ctx = useContext(AnnouncerContext);
  if (!ctx) {
    return fallbackAnnouncer;
  }
  return ctx;
}

export function A11yProvider({ children }: { children: React.ReactNode }) {
  useConsoleArt();
  const [state, dispatch] = useReducer(announcerReducer, initialAnnouncerState);

  const announce = useCallback((message: string, priority: Priority = "polite") => {
    if (typeof message !== "string") return;
    const filteredMessage = message.replace(/\b\d{3}-\d{2}-\d{4}\b/g, "***-**-****");
    const item: AnnounceItem = {
      id: generateAnnounceId(),
      text: filteredMessage,
      priority,
    };
    dispatch({ type: "ANNOUNCE", item });
  }, []);

  const activeAssertiveId = state.activeAssertive?.id;
  const activePoliteId = state.activePolite?.id;

  useEffect(() => {
    const activeId = activeAssertiveId || activePoliteId;
    if (!activeId) return;

    const timer = setTimeout(() => {
      dispatch({ type: "TIMER_EXPIRED" });
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [activeAssertiveId, activePoliteId]);

  const contextValue = useMemo(() => ({ announce }), [announce]);

  return (
    <AnnouncerContext.Provider value={contextValue}>
      {children}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {state.activePolite?.text || ""}
      </div>
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {state.activeAssertive?.text || ""}
      </div>
    </AnnouncerContext.Provider>
  );
}


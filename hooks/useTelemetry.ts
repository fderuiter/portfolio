"use client";

import { useSyncExternalStore, useCallback, useEffect } from "react";
import { sanitizeError } from "@/lib/error-sanitization";

export interface ProjectTelemetry {
  views: number;
  clicks: number;
}

export type TelemetryData = Record<string, ProjectTelemetry>;

const CACHE_KEY = "portfolio_telemetry_cache";
const TELEMETRY_CHANGE_EVENT = "portfolio-telemetry-state-change";

interface TelemetryStoreState {
  telemetry: TelemetryData;
  syncFailed: boolean;
}

interface QueuedEvent {
  projectSlug: string;
  eventType: "page_view" | "project_click" | "route_error";
}

// Global in-memory state
let currentStoreState: TelemetryStoreState = {
  telemetry: {},
  syncFailed: false,
};

let clientEventQueue: QueuedEvent[] = [];
let flushTimer: NodeJS.Timeout | null = null;
let lastRawCache: string | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function updateStore(updater: (prev: TelemetryStoreState) => TelemetryStoreState) {
  const next = updater(currentStoreState);
  if (next.telemetry !== currentStoreState.telemetry || next.syncFailed !== currentStoreState.syncFailed) {
    currentStoreState = next;
    try {
      if (typeof window !== "undefined" && typeof window.localStorage?.setItem === "function") {
        const stringified = JSON.stringify(currentStoreState.telemetry);
        lastRawCache = stringified;
        localStorage.setItem(CACHE_KEY, stringified);
        window.dispatchEvent(new CustomEvent(TELEMETRY_CHANGE_EVENT));
      }
    } catch (e) {
      console.warn("Failed to write to local storage telemetry cache:", sanitizeError(e));
    }
    notifyListeners();
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === CACHE_KEY) {
      lastRawCache = e.newValue;
      if (e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          currentStoreState = {
            ...currentStoreState,
            telemetry: parsed,
          };
          notifyListeners();
        } catch (err) {
          console.warn("Failed to parse cross-tab telemetry storage event:", sanitizeError(err));
        }
      }
    }
  });

  window.addEventListener(TELEMETRY_CHANGE_EVENT, () => {
    notifyListeners();
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): TelemetryStoreState {
  if (typeof window !== "undefined" && typeof window.localStorage?.getItem === "function") {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw !== lastRawCache) {
        lastRawCache = raw;
        if (raw) {
          currentStoreState = {
            ...currentStoreState,
            telemetry: {
              ...currentStoreState.telemetry,
              ...JSON.parse(raw),
            },
          };
        }
      }
    } catch (e) {
      console.warn("Failed to retrieve local storage telemetry cache:", sanitizeError(e));
    }
  }
  return currentStoreState;
}

const SERVER_SNAPSHOT: TelemetryStoreState = {
  telemetry: {},
  syncFailed: false,
};

function getServerSnapshot(): TelemetryStoreState {
  return SERVER_SNAPSHOT;
}

/**
 * Fetch latest telemetry aggregates from the server.
 */
async function fetchTelemetryAggregates() {
  try {
    const res = await fetch("/api/telemetry");
    if (!res.ok) throw new Error("Telemetry sync fetch failure");
    const data = (await res.json()) as TelemetryData;

    updateStore((prev) => ({
      telemetry: { ...prev.telemetry, ...data },
      syncFailed: false,
    }));
  } catch (err) {
    console.error("Background telemetry synchronization failed:", sanitizeError(err));
    updateStore((prev) => ({
      ...prev,
      syncFailed: true,
    }));
  }
}

/**
 * Process client-side telemetry queue and send to POST endpoint
 */
export async function flushQueue() {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  if (clientEventQueue.length === 0) return;

  // Slicing up to 50 events for single batch payload restriction
  const batchToSend = clientEventQueue.slice(0, 50);
  clientEventQueue = clientEventQueue.slice(50);

  // If items remain in queue, reschedule next chunk flush immediately
  if (clientEventQueue.length > 0) {
    scheduleFlush(0);
  }

  try {
    const response = await fetch("/api/telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(batchToSend),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.warn("Telemetry record rate limited by API.");
      } else {
        console.error("Telemetry batch dispatch failed with status:", response.status);
      }
      // Re-enqueue failed batch elements to retry later
      clientEventQueue = [...batchToSend, ...clientEventQueue];
      scheduleFlush(3000); // retry in 3 seconds
      
      updateStore((prev) => ({
        ...prev,
        syncFailed: true,
      }));
    } else {
      updateStore((prev) => ({
        ...prev,
        syncFailed: false,
      }));
    }
  } catch (err) {
    console.error("Optimistic telemetry sync persistence failed:", sanitizeError(err));
    // Return failed batch back to queue for retry
    clientEventQueue = [...batchToSend, ...clientEventQueue];
    scheduleFlush(3000); // retry in 3 seconds

    updateStore((prev) => ({
      ...prev,
      syncFailed: true,
    }));
  }
}

export function scheduleFlush(delayMs: number = 2000) {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flushQueue();
  }, delayMs);
}

/**
 * Custom hook implementing a robust Stale-While-Revalidate (SWR) telemetry system with useSyncExternalStore.
 * Hydrates state instantly from LocalStorage cache to prevent Cumulative Layout Shifts (CLS),
 * schedules background syncs, and supports optimistic updates with automated rollback and retry queuing.
 */
export function useTelemetry() {
  const store = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Trigger SWR sync on mount
  useEffect(() => {
    fetchTelemetryAggregates();
  }, []);

  const recordEvent = useCallback(
    async (projectSlug: string, eventType: "page_view" | "project_click" | "route_error") => {
      // 1. Optimistic Local State Update
      const currentStats = store.telemetry[projectSlug] || { views: 0, clicks: 0 };
      const updatedStats = {
        views: eventType === "page_view" ? currentStats.views + 1 : currentStats.views,
        clicks: eventType === "project_click" ? currentStats.clicks + 1 : currentStats.clicks,
      };

      updateStore((prev) => ({
        ...prev,
        telemetry: {
          ...prev.telemetry,
          [projectSlug]: updatedStats,
        },
      }));

      // Queue the event
      clientEventQueue.push({ projectSlug, eventType });

      // Flush if threshold reached
      if (clientEventQueue.length >= 30) {
        await flushQueue();
      } else {
        scheduleFlush(2000);
      }
    },
    [store.telemetry]
  );

  return {
    telemetry: store.telemetry,
    syncFailed: store.syncFailed,
    recordEvent,
    refetch: fetchTelemetryAggregates,
  };
}

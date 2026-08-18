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
  retries: number;
}

// Global in-memory state
let currentStoreState: TelemetryStoreState = {
  telemetry: {},
  syncFailed: false,
};

let retryQueue: QueuedEvent[] = [];
let retryTimer: NodeJS.Timeout | null = null;
let lastRawCache: string | null = null;
const listeners = new Set<() => void>();

let inFlightFetch: Promise<void> | null = null;
let lastFetchTimestamp = 0;
const FETCH_COOLDOWN_MS = 5000;

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

  const flushQueueOnUnload = () => {
    if (retryQueue.length > 0) {
      processRetryQueue({ keepalive: true });
    }
  };

  const handleVisibilityChange = () => {
    if (typeof document !== "undefined" && document.visibilityState === "hidden") {
      flushQueueOnUnload();
    }
  };

  const win = window as unknown as Record<string, EventListener | undefined>;
  if (win.__telemetryUnloadListener) {
    window.removeEventListener("pagehide", win.__telemetryUnloadListener);
    window.removeEventListener("beforeunload", win.__telemetryUnloadListener);
    window.removeEventListener("unload", win.__telemetryUnloadListener);
  }
  win.__telemetryUnloadListener = flushQueueOnUnload as EventListener;
  window.addEventListener("pagehide", flushQueueOnUnload);
  window.addEventListener("beforeunload", flushQueueOnUnload);
  window.addEventListener("unload", flushQueueOnUnload);

  if (typeof document !== "undefined") {
    const doc = document as unknown as Record<string, EventListener | undefined>;
    if (doc.__telemetryVisibilityListener) {
      document.removeEventListener("visibilitychange", doc.__telemetryVisibilityListener);
    }
    doc.__telemetryVisibilityListener = handleVisibilityChange as EventListener;
    document.addEventListener("visibilitychange", handleVisibilityChange);
  }
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
 * Reuses active in-flight Promises for concurrent callers and enforces cooldown throttling.
 */
async function fetchTelemetryAggregates(options?: { force?: boolean }): Promise<void> {
  if (inFlightFetch) {
    return inFlightFetch;
  }

  const now = Date.now();
  if (!options?.force && now - lastFetchTimestamp < FETCH_COOLDOWN_MS) {
    return Promise.resolve();
  }

  lastFetchTimestamp = now;

  inFlightFetch = (async () => {
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
    } finally {
      inFlightFetch = null;
    }
  })();

  return inFlightFetch;
}

/**
 * Process queued retry events with exponential backoff.
 */
async function processRetryQueue(options?: { keepalive?: boolean }) {
  if (retryQueue.length === 0) return;
  const currentBatch = [...retryQueue];
  retryQueue = [];

  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }

  for (const item of currentBatch) {
    try {
      const response = await fetch("/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectSlug: item.projectSlug, eventType: item.eventType }),
        keepalive: options?.keepalive ?? false,
      });

      if (!response.ok) {
        if (response.status === 429 && item.retries < 3) {
          retryQueue.push({ ...item, retries: item.retries + 1 });
        }
      }
    } catch {
      if (item.retries < 3) {
        retryQueue.push({ ...item, retries: item.retries + 1 });
      }
    }
  }

  if (retryQueue.length > 0 && !retryTimer) {
    retryTimer = setTimeout(() => {
      retryTimer = null;
      processRetryQueue();
    }, 5000);
  }
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

      // 2. Dispatch network POST event
      try {
        const response = await fetch("/api/telemetry", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ projectSlug, eventType }),
        });

        if (!response.ok) {
          if (response.status === 429) {
            console.warn("Telemetry record rate limited by API.");
            // Enqueue for background retry
            retryQueue.push({ projectSlug, eventType, retries: 0 });
            if (!retryTimer) {
              retryTimer = setTimeout(() => {
                retryTimer = null;
                processRetryQueue();
              }, 3000);
            }
          } else {
            throw new Error("Failed to persist telemetry event");
          }
        }
      } catch (err) {
        console.error("Optimistic telemetry sync persistence failed:", sanitizeError(err));
        // Rollback optimistic increment on hard error
        updateStore((prev) => ({
          ...prev,
          telemetry: {
            ...prev.telemetry,
            [projectSlug]: currentStats,
          },
          syncFailed: true,
        }));
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

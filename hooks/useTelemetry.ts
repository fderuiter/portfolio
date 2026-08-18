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

export type TelemetryEventType =
  | "page_view"
  | "project_click"
  | "route_error"
  | "simulator_option_select"
  | "simulator_milestone_reached"
  | "simulator_schedule_click"
  | "simulator_report_copy"
  | (string & {});

export interface QueuedEvent {
  projectSlug: string;
  eventType: TelemetryEventType;
  retries: number;
}

export const DEFAULT_MAX_QUEUE_CAPACITY = 50;
let maxQueueCapacity = DEFAULT_MAX_QUEUE_CAPACITY;

// Global in-memory state
let currentStoreState: TelemetryStoreState = {
  telemetry: {},
  syncFailed: false,
};

let retryQueue: QueuedEvent[] = [];
let retryTimer: NodeJS.Timeout | null = null;
let lastRawCache: string | null = null;
const listeners = new Set<() => void>();

/**
 * Configure the maximum capacity of the in-memory telemetry retry queue.
 * Trims existing queue entries from the front (oldest first) if current length exceeds new capacity.
 *
 * @param capacity Maximum number of queued items permitted.
 */
export function setQueueCapacity(capacity: number): void {
  if (capacity < 1) return;
  maxQueueCapacity = capacity;
  while (retryQueue.length > maxQueueCapacity) {
    retryQueue.shift();
  }
}

/**
 * Get the current maximum capacity limit of the telemetry retry queue.
 *
 * @returns Current maximum item capacity limit.
 */
export function getQueueCapacity(): number {
  return maxQueueCapacity;
}

/**
 * Get a shallow copy of the current in-memory retry queue.
 *
 * @returns Array of currently queued telemetry events.
 */
export function getRetryQueue(): QueuedEvent[] {
  return [...retryQueue];
}

/**
 * Get the number of currently queued telemetry retry items.
 *
 * @returns Number of items currently in the retry queue.
 */
export function getRetryQueueLength(): number {
  return retryQueue.length;
}

/**
 * Clear all queued retry items and cancel any pending retry timers.
 */
export function clearRetryQueue(): void {
  retryQueue = [];
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
}

/**
 * Enqueue a telemetry retry item using synchronous FIFO eviction when capacity is reached.
 *
 * @param item The telemetry event item to enqueue.
 */
export function enqueueRetryItem(item: QueuedEvent): void {
  while (retryQueue.length >= maxQueueCapacity) {
    retryQueue.shift();
  }
  retryQueue.push(item);
}

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

function syncFromStorage() {
  if (typeof window !== "undefined" && typeof window.localStorage?.getItem === "function") {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw !== lastRawCache) {
        lastRawCache = raw;
        if (raw) {
          const parsed = JSON.parse(raw);
          currentStoreState = {
            ...currentStoreState,
            telemetry: {
              ...currentStoreState.telemetry,
              ...parsed,
            },
          };
        }
        notifyListeners();
      }
    } catch (e) {
      console.warn("Failed to retrieve local storage telemetry cache:", sanitizeError(e));
    }
  }
}

if (typeof window !== "undefined") {
  syncFromStorage();

  window.addEventListener("storage", (e) => {
    if (e.key === CACHE_KEY || !e.key) {
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
      } else {
        currentStoreState = {
          ...currentStoreState,
          telemetry: {},
        };
        notifyListeners();
      }
    }
  });

  window.addEventListener(TELEMETRY_CHANGE_EVENT, () => {
    syncFromStorage();
  });

  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      syncFromStorage();
    }
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
  syncFromStorage();
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): TelemetryStoreState {
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
          enqueueRetryItem({ ...item, retries: item.retries + 1 });
        }
      }
    } catch {
      if (item.retries < 3) {
        enqueueRetryItem({ ...item, retries: item.retries + 1 });
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

export interface UseTelemetryOptions {
  maxQueueCapacity?: number;
}

/**
 * Custom hook implementing a robust Stale-While-Revalidate (SWR) telemetry system with useSyncExternalStore.
 * Hydrates state instantly from LocalStorage cache to prevent Cumulative Layout Shifts (CLS),
 * schedules background syncs, and supports optimistic updates with automated retry queuing and FIFO eviction.
 *
 * @param options Optional configuration options including maximum retry queue capacity.
 */
export function useTelemetry(options?: UseTelemetryOptions) {
  if (options?.maxQueueCapacity && options.maxQueueCapacity > 0) {
    setQueueCapacity(options.maxQueueCapacity);
  }

  const store = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Trigger SWR sync on mount
  useEffect(() => {
    fetchTelemetryAggregates();
  }, []);

  const recordEvent = useCallback(
    async (projectSlug: string, eventType: TelemetryEventType) => {
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
            // Enqueue for background retry with FIFO eviction guard
            enqueueRetryItem({ projectSlug, eventType, retries: 0 });
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
    queueLength: getRetryQueueLength(),
    queueCapacity: getQueueCapacity(),
  };
}

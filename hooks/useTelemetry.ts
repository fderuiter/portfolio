"use client";

import { useSyncExternalStore, useCallback, useEffect, startTransition } from "react";
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

export interface RecordEventOptions {
  defer?: boolean;
}

export interface PendingDeferredTask {
  id: string;
  projectSlug: string;
  eventType: TelemetryEventType;
}

interface InternalDeferredTask extends PendingDeferredTask {
  cancel: () => void;
  execute: () => Promise<void>;
}

export const DEFAULT_MAX_QUEUE_CAPACITY = 50;
let maxQueueCapacity = DEFAULT_MAX_QUEUE_CAPACITY;

// Global in-memory state
let currentStoreState: TelemetryStoreState = {
  telemetry: {},
  syncFailed: false,
};

let retryQueue: QueuedEvent[] = [];
let pendingDeferredTasks: InternalDeferredTask[] = [];
let retryTimer: NodeJS.Timeout | null = null;
let lastRawCache: string | null = null;
const listeners = new Set<() => void>();

/**
 * Schedule a task during browser idle periods with a fallback timeout mechanism.
 *
 * @param task The callback task to execute during idle time.
 * @param timeout Maximum timeout delay before forcing task execution.
 * @returns Cancellation function.
 */
export function scheduleIdleTask(task: () => void, timeout = 2000): () => void {
  if (typeof window !== "undefined" && typeof window.requestIdleCallback === "function") {
    const handle = window.requestIdleCallback(() => task(), { timeout });
    return () => {
      if (typeof window !== "undefined" && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(handle);
      }
    };
  } else {
    const timer = setTimeout(task, 50);
    return () => clearTimeout(timer);
  }
}

/**
 * Get array of currently pending deferred telemetry tasks.
 *
 * @returns Array of pending deferred telemetry tasks.
 */
export function getPendingDeferredQueue(): PendingDeferredTask[] {
  return pendingDeferredTasks.map(({ id, projectSlug, eventType }) => ({
    id,
    projectSlug,
    eventType,
  }));
}

/**
 * Get count of currently pending deferred telemetry tasks.
 *
 * @returns Number of pending deferred tasks.
 */
export function getPendingDeferredQueueLength(): number {
  return pendingDeferredTasks.length;
}

/**
 * Clear all pending deferred tasks and cancel their idle timers.
 */
export function clearPendingDeferredQueue(): void {
  for (const task of pendingDeferredTasks) {
    task.cancel();
  }
  pendingDeferredTasks = [];
}

/**
 * Flush all pending deferred tasks immediately using persistent network calls.
 */
export function flushPendingDeferredQueue(): void {
  if (pendingDeferredTasks.length === 0) return;
  const tasksToFlush = [...pendingDeferredTasks];
  pendingDeferredTasks = [];

  for (const task of tasksToFlush) {
    task.cancel();
    try {
      fetch("/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectSlug: task.projectSlug, eventType: task.eventType }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // Safe catch on browser unload
    }
  }
}

const RETRY_QUEUE_CACHE_KEY = "portfolio_telemetry_retry_queue";

function loadPersistedRetryQueue(): QueuedEvent[] {
  if (typeof window !== "undefined" && typeof window.localStorage?.getItem === "function") {
    try {
      const raw = localStorage.getItem(RETRY_QUEUE_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("Failed to retrieve local storage telemetry retry queue:", sanitizeError(e));
    }
  }
  return [];
}

function persistRetryQueue(): void {
  if (typeof window !== "undefined" && typeof window.localStorage?.setItem === "function") {
    try {
      localStorage.setItem(RETRY_QUEUE_CACHE_KEY, JSON.stringify(retryQueue));
    } catch (e) {
      console.warn("Failed to write local storage telemetry retry queue:", sanitizeError(e));
    }
  }
}

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
  persistRetryQueue();
}

/**
 * Get the current maximum capacity limit of the telemetry retry queue.
 *
 * @returns Current maximum item capacity limit.
 */
export function getQueueCapacity(): number {
  return maxQueueCapacity;
}

let hasLoadedRetryQueue = false;

/**
 * Get a shallow copy of the current in-memory retry queue.
 *
 * @returns Array of currently queued telemetry events.
 */
export function getRetryQueue(): QueuedEvent[] {
  if (!hasLoadedRetryQueue && typeof window !== "undefined") {
    hasLoadedRetryQueue = true;
    retryQueue = loadPersistedRetryQueue();
  }
  return [...retryQueue];
}

/**
 * Get the number of currently queued telemetry retry items.
 *
 * @returns Number of items currently in the retry queue.
 */
export function getRetryQueueLength(): number {
  if (!hasLoadedRetryQueue && typeof window !== "undefined") {
    hasLoadedRetryQueue = true;
    retryQueue = loadPersistedRetryQueue();
  }
  return retryQueue.length;
}

/**
 * Clear all queued retry items and cancel any pending retry timers.
 */
export function clearRetryQueue(): void {
  retryQueue = [];
  persistRetryQueue();
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
  persistRetryQueue();
}

let inFlightFetch: Promise<void> | null = null;
let lastFetchTimestamp = 0;
const FETCH_COOLDOWN_MS = 5000;

function notifyListeners() {
  startTransition(() => {
    listeners.forEach((listener) => listener());
  });
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
    flushPendingDeferredQueue();
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
  persistRetryQueue();

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
 * schedules background syncs during idle frames, and supports optimistic updates with automated retry queuing and FIFO eviction.
 *
 * @param options Optional configuration options including maximum retry queue capacity.
 */
export function useTelemetry(options?: UseTelemetryOptions) {
  if (options?.maxQueueCapacity && options.maxQueueCapacity > 0) {
    setQueueCapacity(options.maxQueueCapacity);
  }

  const store = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Trigger SWR sync on mount during browser idle frame
  useEffect(() => {
    let cancelIdle: (() => void) | null = null;
    cancelIdle = scheduleIdleTask(() => {
      fetchTelemetryAggregates();
    }, 2000);

    return () => {
      if (cancelIdle) {
        cancelIdle();
      }
    };
  }, []);

  const recordEvent = useCallback(
    async (
      projectSlug: string,
      eventType: TelemetryEventType,
      options?: RecordEventOptions
    ) => {
      const executeDispatch = async () => {
        // 1. Optimistic Local State Update
        const currentStats = currentStoreState.telemetry[projectSlug] || { views: 0, clicks: 0 };
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

        // 2. Dispatch network POST event with HTTP status code inspection
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
              enqueueRetryItem({ projectSlug, eventType, retries: 0 });
              if (!retryTimer) {
                retryTimer = setTimeout(() => {
                  retryTimer = null;
                  processRetryQueue();
                }, 3000);
              }
            } else {
              throw new Error(`Failed to persist telemetry event with status: ${response.status}`);
            }
          }
        } catch (err) {
          console.error("Optimistic telemetry sync persistence failed:", sanitizeError(err));
          // Rollback optimistic increment on HTTP status error or network failure
          updateStore((prev) => ({
            ...prev,
            telemetry: {
              ...prev.telemetry,
              [projectSlug]: currentStats,
            },
            syncFailed: true,
          }));
        }
      };

      if (options?.defer) {
        const taskId = `${projectSlug}:${eventType}:${Date.now()}:${Math.random()}`;

        let cancelTimer: (() => void) | null = null;
        const runDeferred = async () => {
          pendingDeferredTasks = pendingDeferredTasks.filter((t) => t.id !== taskId);
          await executeDispatch();
        };

        cancelTimer = scheduleIdleTask(() => {
          runDeferred();
        }, 2000);

        pendingDeferredTasks.push({
          id: taskId,
          projectSlug,
          eventType,
          cancel: () => {
            if (cancelTimer) cancelTimer();
          },
          execute: executeDispatch,
        });
      } else {
        await executeDispatch();
      }
    },
    []
  );

  return {
    telemetry: store.telemetry,
    syncFailed: store.syncFailed,
    recordEvent,
    refetch: fetchTelemetryAggregates,
    queueLength: getRetryQueueLength(),
    queueCapacity: getQueueCapacity(),
    pendingDeferredLength: getPendingDeferredQueueLength(),
  };
}


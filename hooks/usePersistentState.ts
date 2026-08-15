"use client";

import { useSyncExternalStore, useCallback, Dispatch, SetStateAction } from "react";

const STORAGE_CHANGE_EVENT = "portfolio-persistent-state-change";

// In-memory cache for raw strings and parsed objects to maintain referential identity
interface CachedEntry<T> {
  raw: string | null;
  parsed: T;
}

const memoryCache = new Map<string, CachedEntry<unknown>>();
const subscribers = new Set<() => void>();

function notifySubscribers() {
  subscribers.forEach((callback) => callback());
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key) {
      memoryCache.delete(event.key);
      notifySubscribers();
    }
  });

  window.addEventListener(STORAGE_CHANGE_EVENT, () => {
    notifySubscribers();
  });
}

function subscribe(callback: () => void) {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

function getStoredSnapshot<T>(key: string, initialValue: T): T {
  if (typeof window === "undefined") {
    return initialValue;
  }

  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
  }

  const cached = memoryCache.get(key) as CachedEntry<T> | undefined;
  if (cached && cached.raw === raw) {
    return cached.parsed;
  }

  if (raw === null) {
    memoryCache.set(key, { raw: null, parsed: initialValue });
    return initialValue;
  }

  try {
    const parsed = JSON.parse(raw) as T;
    memoryCache.set(key, { raw, parsed });
    return parsed;
  } catch (error) {
    console.warn(`Error parsing localStorage key "${key}":`, error);
    memoryCache.set(key, { raw, parsed: initialValue });
    return initialValue;
  }
}

/**
 * Custom hook that works like useState but persists state to localStorage using useSyncExternalStore.
 * Synchronizes seamlessly across multiple hook instances and browser tabs with zero tearing.
 *
 * @param key - The localStorage key to use for this state
 * @param initialValue - The default value if nothing is found in localStorage
 */
export function usePersistentState<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const getSnapshot = useCallback(() => getStoredSnapshot(key, initialValue), [key, initialValue]);
  const getServerSnapshot = useCallback(() => initialValue, [initialValue]);

  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setPersistentState = useCallback(
    (value: SetStateAction<T>) => {
      try {
        const current = getStoredSnapshot(key, initialValue);
        const newValue =
          typeof value === "function"
            ? (value as (prev: T) => T)(current)
            : value;

        if (typeof window !== "undefined") {
          const stringified = JSON.stringify(newValue);
          window.localStorage.setItem(key, stringified);
          memoryCache.set(key, { raw: stringified, parsed: newValue });
          window.dispatchEvent(new CustomEvent(STORAGE_CHANGE_EVENT, { detail: { key } }));
        }
        notifySubscribers();
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, initialValue]
  );

  return [state, setPersistentState];
}

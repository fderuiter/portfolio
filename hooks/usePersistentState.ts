"use client";

import { useSyncExternalStore, useCallback, Dispatch, SetStateAction } from "react";
import { safeStorage } from "@/lib/safe-storage";

// In-memory cache for raw strings and parsed objects to maintain referential identity
interface CachedEntry<T> {
  raw: string | null;
  parsed: T;
}

const memoryCache = new Map<string, CachedEntry<unknown>>();

function subscribe(callback: () => void) {
  return safeStorage.subscribe(callback);
}

function getStoredSnapshot<T>(key: string, initialValue: T): T {
  if (typeof window === "undefined") {
    return initialValue;
  }

  let value: T | null = null;
  try {
    value = safeStorage.getItem<T>(key, initialValue);
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    value = initialValue;
  }

  const raw = value !== null ? JSON.stringify(value) : null;
  const cached = memoryCache.get(key) as CachedEntry<T> | undefined;

  if (cached && cached.raw === raw) {
    return cached.parsed;
  }

  const resolvedValue = value ?? initialValue;
  memoryCache.set(key, { raw, parsed: resolvedValue });
  return resolvedValue;
}

/**
 * Custom hook that works like useState but persists state to localStorage using useSyncExternalStore and safeStorage.
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

        const success = safeStorage.setItem(key, newValue, { expirable: false });
        if (!success) {
          console.warn(`Error setting localStorage key "${key}": Storage unavailable or quota exceeded`);
        }
        memoryCache.set(key, { raw: JSON.stringify(newValue), parsed: newValue });
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, initialValue]
  );

  return [state, setPersistentState];
}


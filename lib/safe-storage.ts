/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { sanitizeError, sanitizeString } from "./error-sanitization";

/**
 * Metadata envelope wrapping values stored via safeStorage.
 * Tracks creation/access timestamps, optional expiration parameters, and LRU eviction flags.
 */
export interface StorageEnvelope<T = unknown> {
  value: T;
  timestamp: number;
  expiresAt?: number | null;
  expirable?: boolean;
  v?: number;
}

/**
 * Options for safe storage set operations.
 */
export interface SetItemOptions {
  ttlMs?: number;
  expiresAt?: number | null;
  expirable?: boolean;
  notifyOnError?: boolean;
}

/**
 * Error detail interface dispatched on safe storage errors.
 */
export interface SafeStorageErrorDetail {
  key?: string;
  action: "getItem" | "setItem" | "removeItem" | "clear" | "evictLRU";
  message: string;
  sanitizedError: Error | string;
}

export type StorageErrorListener = (detail: SafeStorageErrorDetail) => void;

export const SAFE_STORAGE_CHANGE_EVENT = "safe-storage-change";
export const SAFE_STORAGE_ERROR_EVENT = "safe-storage-error";

const KNOWN_USER_PREFERENCES = new Set([
  "sound_volume",
  "sound_muted",
  "sound_profile",
  "sound_a11y_bypass",
  "global-persona",
  "simplified-terminology",
  "crf_studio_theme",
  "garmin_simulator_high_score",
  "working_with_duck_high_score",
  "clinical_chaos_highscore",
  "laser_loon_high_score",
  "retro_labyrinth_highscore",
  "vault_unlocked",
  "achievements",
]);

const memoryFallbackMap = new Map<string, StorageEnvelope<unknown>>();
const memoryOnlyKeys = new Set<string>();
const subscribers = new Set<() => void>();
const errorListeners = new Set<StorageErrorListener>();
let lastProbeError: Error | null = null;

/**
 * Check if user preference key should be protected from LRU eviction.
 */
export function isUserPreferenceKey(key: string): boolean {
  if (KNOWN_USER_PREFERENCES.has(key)) return true;
  if (key.startsWith("user_pref_") || key.startsWith("pref_")) return true;
  return false;
}

/**
 * Check if key matches known cache or telemetry log patterns.
 */
export function isCacheOrTelemetryKey(key: string): boolean {
  if (
    key.includes("telemetry") ||
    key.includes("cache") ||
    key.includes("log") ||
    key.includes("branding") ||
    key.includes("tmp_") ||
    key.startsWith("seen_manual_")
  ) {
    return true;
  }
  return false;
}

/**
 * Evaluates whether browser localStorage is accessible and writable without throwing quota or security errors.
 */
export function isStorageAvailable(): boolean {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return false;
  }
  if (
    typeof window.localStorage.getItem !== "function" ||
    typeof window.localStorage.setItem !== "function" ||
    typeof window.localStorage.removeItem !== "function"
  ) {
    return false;
  }
  try {
    const testKey = "__safe_storage_test_probe__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    lastProbeError = null;
    return true;
  } catch (err) {
    lastProbeError = err instanceof Error ? err : new Error(String(err));
    return false;
  }
}

function notifySubscribers(key?: string) {
  subscribers.forEach((cb) => {
    try {
      cb();
    } catch {
      // Ignore callback errors
    }
  });

  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(
        new CustomEvent(SAFE_STORAGE_CHANGE_EVENT, { detail: { key } })
      );
    } catch {
      // Swallow event errors in isolated environments
    }
  }
}

function notifyStorageError(detail: SafeStorageErrorDetail) {
  const sanitizedMessage = sanitizeString(detail.message);
  const sanitizedErr = sanitizeError(detail.sanitizedError);

  const payload: SafeStorageErrorDetail = {
    ...detail,
    message: sanitizedMessage,
    sanitizedError: sanitizedErr,
  };

  errorListeners.forEach((listener) => {
    try {
      listener(payload);
    } catch {
      // Ignore error listener callback exceptions
    }
  });

  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(
        new CustomEvent(SAFE_STORAGE_ERROR_EVENT, { detail: payload })
      );
    } catch {
      // Ignore custom event dispatch errors
    }
  }
}

if (typeof window !== "undefined") {
  try {
    window.addEventListener("storage", (event) => {
      if (event.key) {
        memoryFallbackMap.delete(event.key);
        memoryOnlyKeys.delete(event.key);
      } else {
        memoryFallbackMap.clear();
        memoryOnlyKeys.clear();
      }
      subscribers.forEach((cb) => {
        try {
          cb();
        } catch {
          // Ignore
        }
      });
    });
  } catch {
    // Ignore window listener setup errors
  }
}

/**
 * Subscribes a listener function to safe storage mutation events.
 */
export function subscribe(callback: () => void): () => void {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

/**
 * Subscribes an error listener function to safe storage error/quota failure events.
 */
export function onError(listener: StorageErrorListener): () => void {
  errorListeners.add(listener);
  return () => {
    errorListeners.delete(listener);
  };
}

/**
 * Retrieves value from local storage with envelope metadata inspection, expiration check, and memory fallback.
 */
export function getItem<T = unknown>(key: string, defaultValue: T | null = null): T | null {
  const now = Date.now();

  if (isStorageAvailable()) {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        let envelope: StorageEnvelope<T> | null = null;
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object" && "value" in parsed && "timestamp" in parsed) {
            envelope = parsed as StorageEnvelope<T>;
          } else {
            envelope = {
              value: parsed as T,
              timestamp: now,
              expirable: !isUserPreferenceKey(key),
              v: 1,
            };
          }
        } catch {
          envelope = {
            value: raw as unknown as T,
            timestamp: now,
            expirable: !isUserPreferenceKey(key),
            v: 1,
          };
        }

        if (envelope) {
          if (envelope.expiresAt && now > envelope.expiresAt) {
            removeItem(key);
            return defaultValue;
          }

          // Update access timestamp
          envelope.timestamp = now;
          memoryFallbackMap.set(key, envelope as StorageEnvelope<unknown>);

          try {
            window.localStorage.setItem(key, JSON.stringify(envelope));
          } catch {
            // Ignore re-touch error
          }

          return envelope.value;
        }
      } else {
        if (!memoryOnlyKeys.has(key)) {
          memoryFallbackMap.delete(key);
        }
      }
    } catch (err) {
      notifyStorageError({
        key,
        action: "getItem",
        message: "Failed to read item from local storage; using memory fallback.",
        sanitizedError: sanitizeError(err),
      });
    }
  }

  const fallback = memoryFallbackMap.get(key) as StorageEnvelope<T> | undefined;
  if (fallback) {
    if (fallback.expiresAt && now > fallback.expiresAt) {
      memoryFallbackMap.delete(key);
      memoryOnlyKeys.delete(key);
      return defaultValue;
    }
    return fallback.value;
  }

  return defaultValue;
}

/**
 * Retrieves raw envelope metadata for a key for debugging and diagnostic inspection.
 */
export function getEnvelope<T = unknown>(key: string): StorageEnvelope<T> | null {
  if (isStorageAvailable()) {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object" && "value" in parsed && "timestamp" in parsed) {
            return parsed as StorageEnvelope<T>;
          }
        } catch {
          // Not an envelope
        }
      }
    } catch {
      // Storage access exception
    }
  }

  const fallback = memoryFallbackMap.get(key) as StorageEnvelope<T> | undefined;
  return fallback || null;
}

/**
 * Perform LRU eviction of expired items and non-critical data keys to free storage space.
 */
export function evictLRU(bytesNeeded = 0): number {
  if (!isStorageAvailable()) return 0;

  const now = Date.now();
  const candidates: Array<{
    key: string;
    timestamp: number;
    size: number;
    isExpired: boolean;
  }> = [];

  try {
    const totalKeys = window.localStorage.length;
    for (let i = 0; i < totalKeys; i++) {
      const k = window.localStorage.key(i);
      if (!k) continue;

      const raw = window.localStorage.getItem(k);
      if (!raw) continue;

      const size = k.length + raw.length;
      let envelope: StorageEnvelope<unknown> | null = null;

      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && "timestamp" in parsed) {
          envelope = parsed as StorageEnvelope<unknown>;
        }
      } catch {
        // Non-envelope key
      }

      if (envelope) {
        const isExpired = Boolean(envelope.expiresAt && now > envelope.expiresAt);
        const isExpirable =
          envelope.expirable === true ||
          Boolean(envelope.expiresAt) ||
          (envelope.expirable !== false && isCacheOrTelemetryKey(k));

        if (isExpired || (isExpirable && envelope.expirable !== false && !isUserPreferenceKey(k))) {
          candidates.push({
            key: k,
            timestamp: envelope.timestamp || 0,
            size,
            isExpired,
          });
        }
      } else {
        if (isCacheOrTelemetryKey(k) && !isUserPreferenceKey(k)) {
          candidates.push({
            key: k,
            timestamp: 0,
            size,
            isExpired: false,
          });
        }
      }
    }
  } catch (err) {
    notifyStorageError({
      action: "evictLRU",
      message: "Failed to scan local storage keys for LRU eviction.",
      sanitizedError: sanitizeError(err),
    });
    return 0;
  }

  candidates.sort((a, b) => {
    if (a.isExpired !== b.isExpired) {
      return a.isExpired ? -1 : 1;
    }
    return a.timestamp - b.timestamp;
  });

  let freedBytes = 0;
  let freedCount = 0;

  for (const candidate of candidates) {
    try {
      window.localStorage.removeItem(candidate.key);
      memoryFallbackMap.delete(candidate.key);
      memoryOnlyKeys.delete(candidate.key);
      freedBytes += candidate.size;
      freedCount++;

      if (bytesNeeded > 0 && freedBytes >= bytesNeeded) {
        break;
      }
    } catch {
      // Continue attempting eviction on other candidates
    }
  }

  if (freedCount > 0) {
    notifySubscribers();
  }

  return freedCount;
}

/**
 * Stores a key-value pair wrapped in a metadata envelope, with quota pre-checks, automated LRU eviction, and memory fallback.
 */
export function setItem<T = unknown>(key: string, value: T, options?: SetItemOptions): boolean {
  const now = Date.now();
  const ttlMs = options?.ttlMs;
  const expiresAt = options?.expiresAt ?? (ttlMs ? now + ttlMs : null);
  const expirable = options?.expirable ?? (expiresAt !== null || isCacheOrTelemetryKey(key));

  const envelope: StorageEnvelope<T> = {
    value,
    timestamp: now,
    expiresAt,
    expirable: isUserPreferenceKey(key) ? false : expirable,
    v: 1,
  };

  memoryFallbackMap.set(key, envelope as StorageEnvelope<unknown>);

  if (!isStorageAvailable()) {
    memoryOnlyKeys.add(key);
    const probeErr = lastProbeError || new Error("Storage restricted or unavailable");
    const sanitizedProbeErr = sanitizeError(probeErr);
    console.warn("Failed to write to local storage telemetry cache:", sanitizedProbeErr);
    notifyStorageError({
      key,
      action: "setItem",
      message: "Browser storage is unavailable or restricted. Saved state to session memory fallback.",
      sanitizedError: sanitizedProbeErr,
    });
    notifySubscribers(key);
    return false;
  }

  const payload = JSON.stringify(envelope);

  try {
    window.localStorage.setItem(key, payload);
    memoryOnlyKeys.delete(key);
    notifySubscribers(key);
    return true;
  } catch (err) {
    // Attempt eviction on quota exceeded
    const freedCount = evictLRU(payload.length);
    if (freedCount > 0) {
      try {
        window.localStorage.setItem(key, payload);
        memoryOnlyKeys.delete(key);
        notifySubscribers(key);
        return true;
      } catch (retryErr) {
        memoryOnlyKeys.add(key);
        const sanitized = sanitizeError(retryErr);
        console.warn("Failed to write to local storage telemetry cache:", sanitized);
        notifyStorageError({
          key,
          action: "setItem",
          message: "Storage quota exceeded despite eviction. Preserving state in session memory.",
          sanitizedError: sanitized,
        });
        notifySubscribers(key);
        return false;
      }
    } else {
      memoryOnlyKeys.add(key);
      const sanitized = sanitizeError(err);
      console.warn("Failed to write to local storage telemetry cache:", sanitized);
      notifyStorageError({
        key,
        action: "setItem",
        message: "Storage quota exceeded with no evictable keys remaining. Preserving state in session memory.",
        sanitizedError: sanitized,
      });
      notifySubscribers(key);
      return false;
    }
  }
}

/**
 * Removes a key from both local storage and in-memory fallback cache.
 */
export function removeItem(key: string): void {
  memoryFallbackMap.delete(key);
  memoryOnlyKeys.delete(key);

  if (isStorageAvailable()) {
    try {
      window.localStorage.removeItem(key);
    } catch (err) {
      notifyStorageError({
        key,
        action: "removeItem",
        message: "Failed to remove key from local storage.",
        sanitizedError: sanitizeError(err),
      });
    }
  }

  notifySubscribers(key);
}

/**
 * Clears all managed keys from local storage and in-memory fallback cache.
 */
export function clear(): void {
  memoryFallbackMap.clear();
  memoryOnlyKeys.clear();

  if (isStorageAvailable()) {
    try {
      window.localStorage.clear();
    } catch (err) {
      notifyStorageError({
        action: "clear",
        message: "Failed to clear local storage.",
        sanitizedError: sanitizeError(err),
      });
    }
  }

  notifySubscribers();
}

/**
 * Centralized Safe Storage Utility instance.
 */
export const safeStorage = {
  getItem,
  setItem,
  removeItem,
  clear,
  getEnvelope,
  isStorageAvailable,
  evictLRU,
  subscribe,
  onError,
  isUserPreferenceKey,
  isCacheOrTelemetryKey,
};

export default safeStorage;

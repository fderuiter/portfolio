/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { safeStorage } from "@/lib/safe-storage";

class MockStorage {
  private store: Record<string, string> = {};
  getItem(key: string) {
    return this.store[key] ?? null;
  }
  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }
  removeItem(key: string) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
  get length() {
    return Object.keys(this.store).length;
  }
  key(index: number) {
    return Object.keys(this.store)[index] ?? null;
  }
}

describe("Centralized Safe Storage Utility with LRU Metadata Eviction", () => {
  let mockStorage: MockStorage;

  beforeEach(() => {
    mockStorage = new MockStorage();
    Object.defineProperty(window, "localStorage", {
      value: mockStorage,
      writable: true,
      configurable: true,
    });
    safeStorage.clear();
  });

  afterEach(() => {
    safeStorage.clear();
  });

  it("attaches metadata envelopes with access timestamps and expiration limits", () => {
    const success = safeStorage.setItem("cache_key", { count: 42 }, { ttlMs: 5000, expirable: true });
    expect(success).toBe(true);

    const value = safeStorage.getItem<{ count: number }>("cache_key");
    expect(value).toEqual({ count: 42 });

    const envelope = safeStorage.getEnvelope<{ count: number }>("cache_key");
    expect(envelope).not.toBeNull();
    expect(envelope?.value).toEqual({ count: 42 });
    expect(envelope?.expirable).toBe(true);
    expect(envelope?.expiresAt).toBeGreaterThan(Date.now());
    expect(typeof envelope?.timestamp).toBe("number");
  });

  it("evicts expired keys immediately on getItem and during LRU sweep", () => {
    const now = Date.now();
    // Set item expired 100ms ago
    safeStorage.setItem("expired_item", "old_data", { expiresAt: now - 100, expirable: true });

    const value = safeStorage.getItem("expired_item");
    expect(value).toBeNull();
    expect(safeStorage.getEnvelope("expired_item")).toBeNull();
  });

  it("automatically triggers LRU eviction of expirable keys when quota is exceeded", () => {
    // Populate storage with older and newer expirable entries
    const past = Date.now() - 10000;
    safeStorage.setItem("telemetry_old", "log1", { expirable: true });
    safeStorage.setItem("telemetry_new", "log2", { expirable: true });

    // Manually tweak timestamp of telemetry_old to be older
    const oldEnvelope = safeStorage.getEnvelope("telemetry_old");
    if (oldEnvelope) {
      oldEnvelope.timestamp = past;
      mockStorage.setItem("telemetry_old", JSON.stringify(oldEnvelope));
    }

    // Protect user preference key
    safeStorage.setItem("sound_volume", 0.8, { expirable: false });

    // Mock setItem to throw QuotaExceededError on next write, then succeed after eviction
    let writeAttempts = 0;
    const realSetItem = mockStorage.setItem.bind(mockStorage);
    mockStorage.setItem = (key: string, val: string) => {
      if (key === "new_large_key" && writeAttempts === 0) {
        writeAttempts++;
        const err = new DOMException("QuotaExceededError", "QuotaExceededError");
        throw err;
      }
      realSetItem(key, val);
    };

    const success = safeStorage.setItem("new_large_key", "heavy_data", { expirable: true });
    expect(success).toBe(true);
    expect(safeStorage.getItem("new_large_key")).toBe("heavy_data");

    // Oldest expirable key should be evicted
    expect(safeStorage.getItem("telemetry_old")).toBeNull();

    // Core user preference key must NOT be evicted
    expect(safeStorage.getItem("sound_volume")).toBe(0.8);
  });

  it("falls back to in-memory store when storage access is restricted or persistent quota full", () => {
    // Mock storage write failure
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: () => null,
        setItem: () => {
          throw new Error("Storage access blocked in private mode");
        },
        removeItem: () => {},
        clear: () => {},
        length: 0,
        key: () => null,
      },
      writable: true,
      configurable: true,
    });

    const success = safeStorage.setItem("private_key", "active_session_data");
    expect(success).toBe(false);

    // Active state update is retained 100% in memory fallback
    expect(safeStorage.getItem("private_key")).toBe("active_session_data");
  });

  it("sanitizes intercepted storage errors before emitting error events", () => {
    const originalEnv = process.env.NODE_ENV;
    (process.env as any).NODE_ENV = "production";

    try {
      let capturedErrorDetail: any = null;

      const unsubscribe = safeStorage.onError((detail) => {
        capturedErrorDetail = detail;
      });

      // Mock storage to throw an error with sensitive absolute paths
      const rawError = new Error("Failed writing to C:\\Users\\Administrator\\app\\secret\\store.js: Quota exceeded at /app/server/index.ts:42");
      rawError.stack = "Error: Failed writing\n    at /app/server/index.ts:42:15\n    at C:\\Users\\Admin\\app\\index.js:10";

      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: () => null,
          setItem: () => {
            throw rawError;
          },
          removeItem: () => {},
          clear: () => {},
          length: 0,
          key: () => null,
        },
        writable: true,
        configurable: true,
      });

      safeStorage.setItem("err_key", "val");

      expect(capturedErrorDetail).not.toBeNull();
      expect(capturedErrorDetail.message).not.toContain("C:\\Users\\Administrator");
      expect(capturedErrorDetail.message).not.toContain("/app/server/index.ts");
      expect(capturedErrorDetail.sanitizedError.message).not.toContain("/app/server/index.ts");

      unsubscribe();
    } finally {
      (process.env as any).NODE_ENV = originalEnv;
    }
  });

  it("notifies subscribers and synchronizes updates across instances", () => {
    const subscriberSpy = vi.fn();
    const unsubscribe = safeStorage.subscribe(subscriberSpy);

    safeStorage.setItem("sync_key", "val1");
    expect(subscriberSpy).toHaveBeenCalled();

    safeStorage.removeItem("sync_key");
    expect(subscriberSpy).toHaveBeenCalledTimes(2);

    unsubscribe();
  });
});

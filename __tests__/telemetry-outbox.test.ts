import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  TelemetryOutbox,
  DEFAULT_OUTBOX_CAPACITY,
  type TelemetryOutboxItem,
  type TelemetryStorage,
  type TelemetryTransport,
} from "@/lib/telemetry/outbox";

class MockStorage implements TelemetryStorage {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

describe("TelemetryOutbox Contract Test Suite", () => {
  let mockStorage: MockStorage;

  beforeEach(() => {
    vi.useFakeTimers();
    mockStorage = new MockStorage();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("1. FIFO Capacity Bounding & Queue Management", () => {
    it("initializes with default capacity of 50 items", () => {
      const outbox = new TelemetryOutbox({ storage: null, autoFlushOnUnload: false });
      expect(outbox.getCapacity()).toBe(DEFAULT_OUTBOX_CAPACITY);
      expect(DEFAULT_OUTBOX_CAPACITY).toBe(50);
      expect(outbox.size).toBe(0);
      expect(outbox.isEmpty).toBe(true);
      outbox.destroy();
    });

    it("respects custom initial capacity in configuration", () => {
      const outbox = new TelemetryOutbox({
        maxCapacity: 5,
        storage: null,
        autoFlushOnUnload: false,
      });
      expect(outbox.getCapacity()).toBe(5);

      for (let i = 1; i <= 10; i++) {
        outbox.enqueue({
          projectSlug: `project-${i}`,
          eventType: "page_view",
        });
      }

      expect(outbox.size).toBe(5);
      expect(outbox.isEmpty).toBe(false);
      outbox.destroy();
    });

    it("evicts oldest event (FIFO) and retains newest event when capacity is reached", () => {
      const outbox = new TelemetryOutbox({
        maxCapacity: 3,
        storage: null,
        autoFlushOnUnload: false,
      });

      outbox.enqueue({ projectSlug: "event-1", eventType: "page_view" });
      outbox.enqueue({ projectSlug: "event-2", eventType: "project_click", retries: 1 });
      outbox.enqueue({ projectSlug: "event-3", eventType: "route_error", retries: 2 });

      expect(outbox.size).toBe(3);
      expect(outbox.peek()?.projectSlug).toBe("event-1");

      // Add 4th item to exceed capacity 3
      outbox.enqueue({ projectSlug: "event-4", eventType: "page_view" });

      expect(outbox.size).toBe(3);
      const queue = outbox.getQueue();
      expect(queue.map((item: TelemetryOutboxItem) => item.projectSlug)).toEqual(["event-2", "event-3", "event-4"]);
      expect(queue[0].retries).toBe(1);
      expect(queue[1].retries).toBe(2);
      expect(queue[2].retries).toBe(0);

      outbox.destroy();
    });

    it("dynamically trims oldest entries when reducing capacity", () => {
      const outbox = new TelemetryOutbox({
        maxCapacity: 10,
        storage: null,
        autoFlushOnUnload: false,
      });

      for (let i = 1; i <= 8; i++) {
        outbox.enqueue({ projectSlug: `item-${i}`, eventType: "page_view" });
      }
      expect(outbox.size).toBe(8);

      outbox.setCapacity(4);
      expect(outbox.getCapacity()).toBe(4);
      expect(outbox.size).toBe(4);

      const queue = outbox.getQueue();
      expect(queue.map((i: TelemetryOutboxItem) => i.projectSlug)).toEqual(["item-5", "item-6", "item-7", "item-8"]);

      // Ignore invalid capacity <= 0
      outbox.setCapacity(0);
      expect(outbox.getCapacity()).toBe(4);
      outbox.setCapacity(-5);
      expect(outbox.getCapacity()).toBe(4);

      outbox.destroy();
    });

    it("synchronously clears queue and resets metrics", () => {
      const outbox = new TelemetryOutbox({ storage: null, autoFlushOnUnload: false });
      outbox.enqueue({ projectSlug: "test", eventType: "page_view" });
      expect(outbox.size).toBe(1);

      outbox.clear();
      expect(outbox.size).toBe(0);
      expect(outbox.isEmpty).toBe(true);
      expect(outbox.getQueue()).toEqual([]);
      expect(outbox.peek()).toBeUndefined();

      outbox.destroy();
    });
  });

  describe("2. Direct Dispatch & Transport Resolution", () => {
    it("successfully sends item immediately when transport succeeds without enqueueing", async () => {
      const mockTransport: TelemetryTransport = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
      });
      const onSuccess = vi.fn();
      const onRollback = vi.fn();

      const outbox = new TelemetryOutbox({
        transport: mockTransport,
        storage: null,
        autoFlushOnUnload: false,
        onSuccess,
        onRollback,
      });

      const item: TelemetryOutboxItem = { projectSlug: "fast-path", eventType: "page_view" };
      const result = await outbox.send(item);

      expect(result).toBe(true);
      expect(mockTransport).toHaveBeenCalledTimes(1);
      expect(mockTransport).toHaveBeenCalledWith(item, { keepalive: false });
      expect(onSuccess).toHaveBeenCalledWith(item);
      expect(onRollback).not.toHaveBeenCalled();
      expect(outbox.size).toBe(0);

      outbox.destroy();
    });

    it("enqueues item and schedules retry worker on network error during direct send", async () => {
      const mockTransport: TelemetryTransport = vi.fn().mockRejectedValue(new Error("Network Down"));
      const onRollback = vi.fn();

      const outbox = new TelemetryOutbox({
        transport: mockTransport,
        storage: null,
        autoFlushOnUnload: false,
        baseDelayMs: 500,
        onRollback,
      });

      const item: TelemetryOutboxItem = { projectSlug: "offline-event", eventType: "page_view" };
      const result = await outbox.send(item);

      expect(result).toBe(false);
      expect(outbox.size).toBe(1);
      expect(outbox.getQueue()[0]).toEqual(expect.objectContaining({
        projectSlug: "offline-event",
        eventType: "page_view",
        retries: 0,
      }));
      expect(onRollback).not.toHaveBeenCalled();

      outbox.destroy();
    });
  });

  describe("3. Exponential Backoff Retries on 5xx & Network Errors", () => {
    it("retries failed items with exponential backoff delays and marks success upon recovery", async () => {
      let callCount = 0;
      const mockTransport: TelemetryTransport = vi.fn().mockImplementation(async () => {
        callCount++;
        if (callCount < 3) {
          return { ok: false, status: 503, statusText: "Service Unavailable" };
        }
        return { ok: true, status: 200 };
      });

      const onSuccess = vi.fn();
      const onRollback = vi.fn();

      const outbox = new TelemetryOutbox({
        transport: mockTransport,
        storage: null,
        autoFlushOnUnload: false,
        baseDelayMs: 1000,
        maxRetries: 3,
        onSuccess,
        onRollback,
      });

      outbox.enqueue({ projectSlug: "retry-target", eventType: "page_view" });
      expect(outbox.size).toBe(1);

      // 1st attempt fails at t = 1000ms (1000 * 2^0)
      await vi.advanceTimersByTimeAsync(1000);
      expect(mockTransport).toHaveBeenCalledTimes(1);
      expect(outbox.size).toBe(1);
      expect(outbox.getQueue()[0].retries).toBe(1);

      // 2nd attempt fails at t = 1000 + 2000 = 3000ms (1000 * 2^1)
      await vi.advanceTimersByTimeAsync(2000);
      expect(mockTransport).toHaveBeenCalledTimes(2);
      expect(outbox.size).toBe(1);
      expect(outbox.getQueue()[0].retries).toBe(2);

      // 3rd attempt succeeds at t = 3000 + 4000 = 7000ms (1000 * 2^2)
      await vi.advanceTimersByTimeAsync(4000);
      expect(mockTransport).toHaveBeenCalledTimes(3);
      expect(outbox.size).toBe(0);
      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onRollback).not.toHaveBeenCalled();

      outbox.destroy();
    });

    it("permanently drops item and triggers rollback when maxRetries is exceeded", async () => {
      const mockTransport: TelemetryTransport = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      const onRollback = vi.fn();
      const onSuccess = vi.fn();

      const outbox = new TelemetryOutbox({
        transport: mockTransport,
        storage: null,
        autoFlushOnUnload: false,
        baseDelayMs: 100,
        maxRetries: 2,
        onRollback,
        onSuccess,
      });

      const initialItem: TelemetryOutboxItem = { projectSlug: "failing-event", eventType: "page_view" };
      outbox.enqueue(initialItem);

      // Attempt 1: retries 0 -> 1 (fails)
      await vi.advanceTimersByTimeAsync(100);
      expect(mockTransport).toHaveBeenCalledTimes(1);
      expect(outbox.size).toBe(1);
      expect(outbox.getQueue()[0].retries).toBe(1);

      // Attempt 2: retries 1 -> 2 (fails)
      await vi.advanceTimersByTimeAsync(200);
      expect(mockTransport).toHaveBeenCalledTimes(2);
      expect(outbox.size).toBe(1);
      expect(outbox.getQueue()[0].retries).toBe(2);

      // Attempt 3: retries 2 -> reaches maxRetries (2) -> dropped & rolled back
      await vi.advanceTimersByTimeAsync(400);
      expect(mockTransport).toHaveBeenCalledTimes(3);
      expect(outbox.size).toBe(0);
      expect(onRollback).toHaveBeenCalledTimes(1);
      expect(onRollback).toHaveBeenCalledWith(
        expect.objectContaining({ projectSlug: "failing-event", eventType: "page_view" }),
        "max_retries_exceeded",
        expect.anything()
      );
      expect(onSuccess).not.toHaveBeenCalled();

      outbox.destroy();
    });

    it("clamps retry delays to maxDelayMs configuration limit", async () => {
      const mockTransport: TelemetryTransport = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      const outbox = new TelemetryOutbox({
        transport: mockTransport,
        storage: null,
        autoFlushOnUnload: false,
        baseDelayMs: 1000,
        maxDelayMs: 2500,
        maxRetries: 5,
      });

      outbox.enqueue({ projectSlug: "clamp-test", eventType: "page_view", retries: 3 });
      // 1000 * 2^3 = 8000ms, but clamped to 2500ms
      await vi.advanceTimersByTimeAsync(2400);
      expect(mockTransport).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(100);
      expect(mockTransport).toHaveBeenCalledTimes(1);

      outbox.destroy();
    });
  });

  describe("4. Targeted Rollback on HTTP 429 Rate Limit", () => {
    it("immediately rolls back and drops item upon receiving 429 Rate Limit without retrying", async () => {
      const mockTransport: TelemetryTransport = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
      });

      const onRollback = vi.fn();
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const outbox = new TelemetryOutbox({
        transport: mockTransport,
        storage: null,
        autoFlushOnUnload: false,
        onRollback,
      });

      const item: TelemetryOutboxItem = { projectSlug: "rate-limited-slug", eventType: "project_click" };
      const directSendResult = await outbox.send(item);

      expect(directSendResult).toBe(false);
      expect(outbox.size).toBe(0);
      expect(onRollback).toHaveBeenCalledTimes(1);
      expect(onRollback).toHaveBeenCalledWith(item, "rate_limited");
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
      outbox.destroy();
    });

    it("drops 429 items during batch retry flush while allowing other items to process", async () => {
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const mockTransport: TelemetryTransport = vi.fn().mockImplementation(async (item: TelemetryOutboxItem) => {
        if (item.projectSlug === "rate-limited") {
          return { ok: false, status: 429 };
        }
        return { ok: true, status: 200 };
      });

      const onRollback = vi.fn();
      const onSuccess = vi.fn();

      const outbox = new TelemetryOutbox({
        transport: mockTransport,
        storage: null,
        autoFlushOnUnload: false,
        onRollback,
        onSuccess,
      });

      outbox.enqueue({ projectSlug: "rate-limited", eventType: "page_view" });
      outbox.enqueue({ projectSlug: "healthy-item", eventType: "page_view" });

      await outbox.flush();

      expect(outbox.size).toBe(0);
      expect(onRollback).toHaveBeenCalledWith(
        expect.objectContaining({ projectSlug: "rate-limited" }),
        "rate_limited"
      );
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ projectSlug: "healthy-item" })
      );

      consoleWarnSpy.mockRestore();
      outbox.destroy();
    });
  });

  describe("5. Storage Serialization & State Hydration", () => {
    it("persists enqueued items to storage and hydrates state on initialization", () => {
      const storageKey = "test_telemetry_outbox";
      const outbox1 = new TelemetryOutbox({
        storage: mockStorage,
        storageKey,
        maxCapacity: 10,
        autoFlushOnUnload: false,
      });

      outbox1.enqueue({ projectSlug: "persisted-1", eventType: "page_view" });
      outbox1.enqueue({ projectSlug: "persisted-2", eventType: "project_click", retries: 1 });

      const raw = mockStorage.getItem(storageKey);
      expect(raw).toBeTruthy();
      const parsed = JSON.parse(raw!);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].projectSlug).toBe("persisted-1");
      expect(parsed[1].projectSlug).toBe("persisted-2");

      outbox1.destroy();

      // Instantiate new outbox instance with same storage
      const outbox2 = new TelemetryOutbox({
        storage: mockStorage,
        storageKey,
        maxCapacity: 10,
        autoFlushOnUnload: false,
      });

      expect(outbox2.size).toBe(2);
      expect(outbox2.getQueue()).toEqual([
        expect.objectContaining({ projectSlug: "persisted-1", eventType: "page_view" }),
        expect.objectContaining({ projectSlug: "persisted-2", eventType: "project_click", retries: 1 }),
      ]);

      outbox2.clear();
      expect(mockStorage.getItem(storageKey)).toBeNull();

      outbox2.destroy();
    });

    it("gracefully recovers from corrupt JSON data in storage", () => {
      const storageKey = "corrupt_telemetry_outbox";
      mockStorage.setItem(storageKey, "{invalid-json-data");

      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const outbox = new TelemetryOutbox({
        storage: mockStorage,
        storageKey,
        autoFlushOnUnload: false,
      });

      expect(outbox.size).toBe(0);
      expect(outbox.isEmpty).toBe(true);

      consoleWarnSpy.mockRestore();
      outbox.destroy();
    });

    it("safely handles storage write exceptions (quota exceeded)", () => {
      const throwingStorage: TelemetryStorage = {
        getItem: () => null,
        setItem: () => {
          throw new Error("QuotaExceededError");
        },
        removeItem: () => {},
      };

      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const outbox = new TelemetryOutbox({
        storage: throwingStorage,
        autoFlushOnUnload: false,
      });

      // Should not throw
      expect(() => {
        outbox.enqueue({ projectSlug: "quota-test", eventType: "page_view" });
      }).not.toThrow();
      expect(outbox.size).toBe(1);

      consoleWarnSpy.mockRestore();
      outbox.destroy();
    });
  });

  describe("6. Unload Beacons & Keepalive Dispatching", () => {
    it("flushes queue with keepalive: true on window pagehide and beforeunload events", async () => {
      const mockTransport: TelemetryTransport = vi.fn().mockResolvedValue({ ok: true, status: 200 });

      const outbox = new TelemetryOutbox({
        transport: mockTransport,
        storage: null,
        autoFlushOnUnload: true,
      });

      outbox.enqueue({ projectSlug: "beacon-event", eventType: "page_view" });
      expect(outbox.size).toBe(1);

      // Simulate window pagehide
      window.dispatchEvent(new Event("pagehide"));

      expect(mockTransport).toHaveBeenCalledWith(
        expect.objectContaining({ projectSlug: "beacon-event" }),
        { keepalive: true }
      );

      outbox.destroy();
    });

    it("flushes queue with keepalive: true on document visibilitychange to hidden", async () => {
      const mockTransport: TelemetryTransport = vi.fn().mockResolvedValue({ ok: true, status: 200 });

      const outbox = new TelemetryOutbox({
        transport: mockTransport,
        storage: null,
        autoFlushOnUnload: true,
      });

      outbox.enqueue({ projectSlug: "visibility-beacon", eventType: "project_click" });
      expect(outbox.size).toBe(1);

      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        get: () => "hidden",
      });

      document.dispatchEvent(new Event("visibilitychange"));

      expect(mockTransport).toHaveBeenCalledWith(
        expect.objectContaining({ projectSlug: "visibility-beacon" }),
        { keepalive: true }
      );

      outbox.destroy();
    });
  });

  describe("7. Lifecycle & Clean Destruction", () => {
    it("unregisters event listeners and cancels timers on destroy()", async () => {
      const mockTransport = vi.fn().mockResolvedValue({ ok: true, status: 200 });
      const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

      const outbox = new TelemetryOutbox({
        transport: mockTransport,
        storage: null,
        autoFlushOnUnload: true,
        baseDelayMs: 1000,
      });

      outbox.enqueue({ projectSlug: "timer-item", eventType: "page_view" });
      expect(outbox.isDestroyed).toBe(false);

      outbox.destroy();

      expect(outbox.isDestroyed).toBe(true);
      expect(removeEventListenerSpy).toHaveBeenCalledWith("pagehide", expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function));

      // Advance timers to confirm no background retry runs after destroy
      (mockTransport as unknown as ReturnType<typeof vi.fn>).mockClear();
      await vi.advanceTimersByTimeAsync(5000);
      expect(mockTransport).not.toHaveBeenCalled();

      // Subsequent actions on destroyed instance should be safe no-ops
      outbox.enqueue({ projectSlug: "no-op", eventType: "page_view" });
      expect(outbox.size).toBe(0);

      removeEventListenerSpy.mockRestore();
    });
  });
});

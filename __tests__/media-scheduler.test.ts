import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  mediaScheduler,
  getNetworkConnectionInfo,
  MEDIA_PRIORITY,
} from "../lib/media-scheduler";

describe("Viewport-Aware Media Scheduler Engine", () => {
  beforeEach(() => {
    mediaScheduler.clearQueue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("inspects network connection information cleanly", () => {
    const info = getNetworkConnectionInfo();
    expect(info).toHaveProperty("isConstrained");
    expect(info).toHaveProperty("effectiveType");
    expect(info).toHaveProperty("maxConcurrentDownloads");
  });

  it("schedules and executes critical above-the-fold assets immediately", async () => {
    const mockLoader = vi.fn().mockResolvedValue("hero-image.jpg");

    const result = await mediaScheduler.schedule("hero-asset", mockLoader, {
      priority: MEDIA_PRIORITY.CRITICAL_ABOVE_THE_FOLD,
      isAboveTheFold: true,
    });

    expect(result).toBe("hero-image.jpg");
    expect(mockLoader).toHaveBeenCalledTimes(1);
  });

  it("prioritizes higher-priority tasks over lower-priority below-the-fold tasks when queued", async () => {
    const executionOrder: string[] = [];

    // Mock network as constrained so low-priority task is queued/deferred first
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: { effectiveType: "3g", downlink: 1.0, rtt: 400, saveData: false },
    });

    const lowTaskPromise = mediaScheduler.schedule(
      "low-task",
      async () => {
        executionOrder.push("low");
        return "low";
      },
      { priority: MEDIA_PRIORITY.LOW, isAboveTheFold: false, isNearViewport: false }
    );

    const highTaskPromise = mediaScheduler.schedule(
      "high-task",
      async () => {
        executionOrder.push("high");
        return "high";
      },
      { priority: MEDIA_PRIORITY.HIGH, isAboveTheFold: true, isNearViewport: true }
    );

    // Update lowTask proximity so it executes after highTask
    mediaScheduler.updateTaskProximity("low-task", true);

    await Promise.all([lowTaskPromise, highTaskPromise]);

    expect(executionOrder[0]).toBe("high");
    expect(executionOrder[1]).toBe("low");
  });

  it("defers low-priority tasks on constrained slow connections until viewport proximity triggers", async () => {
    // Mock navigator.connection as slow 2g
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: {
        effectiveType: "2g",
        downlink: 0.4,
        rtt: 800,
        saveData: true,
      },
    });

    const mockLoader = vi.fn().mockResolvedValue("below-fold-3d.glb");

    const taskPromise = mediaScheduler.schedule("below-fold-model", mockLoader, {
      priority: MEDIA_PRIORITY.LOW,
      isAboveTheFold: false,
      requiresViewportProximity: true,
      isNearViewport: false,
    });

    const snapshotBefore = mediaScheduler.getQueueSnapshot();
    expect(snapshotBefore.tasks.some((t) => t.id === "below-fold-model" && t.status === "DEFERRED")).toBe(true);

    // Simulate user scrolling near viewport
    mediaScheduler.updateTaskProximity("below-fold-model", true);

    const result = await taskPromise;
    expect(result).toBe("below-fold-3d.glb");
    expect(mockLoader).toHaveBeenCalledTimes(1);
  });

  it("notifies subscribers when task statuses transition", async () => {
    const subscriber = vi.fn();
    const unsubscribe = mediaScheduler.subscribe(subscriber);

    await mediaScheduler.schedule("sub-test", () => Promise.resolve("ok"), {
      priority: MEDIA_PRIORITY.HIGH,
      isAboveTheFold: true,
    });

    expect(subscriber).toHaveBeenCalled();
    unsubscribe();
  });
});

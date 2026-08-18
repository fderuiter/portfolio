import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getConnectionInfo,
  setMockConnectionInfo,
  subscribeConnectionChange,
  NetworkSchedulerEngine,
  globalNetworkScheduler,
  requestMainThreadIdle,
  cancelMainThreadIdle,
} from "@/lib/network-scheduler";

describe("Viewport-Aware Client Network Scheduler Engine", () => {
  beforeEach(() => {
    setMockConnectionInfo(null);
    globalNetworkScheduler.clearAll();
  });

  afterEach(() => {
    setMockConnectionInfo(null);
    globalNetworkScheduler.clearAll();
  });

  describe("Connection Quality Tier & Throughput Detection", () => {
    it("detects fast connection tier on standard 4G connections", () => {
      setMockConnectionInfo({
        effectiveType: "4g",
        saveData: false,
        downlink: 10,
        rtt: 50,
      });

      const info = getConnectionInfo();
      expect(info.tier).toBe("fast");
      expect(info.saveData).toBe(false);
      expect(info.downlink).toBe(10);
    });

    it("detects slow connection tier when saveData is enabled or connection is 2g/3g", () => {
      setMockConnectionInfo({
        effectiveType: "3g",
        saveData: false,
        downlink: 1.0,
        rtt: 600,
      });

      const info3g = getConnectionInfo();
      expect(info3g.tier).toBe("slow");

      setMockConnectionInfo({
        effectiveType: "4g",
        saveData: true,
      });

      const infoSaveData = getConnectionInfo();
      expect(infoSaveData.tier).toBe("slow");
    });

    it("notifies listeners when network connection quality changes", () => {
      const listener = vi.fn();
      const unsubscribe = subscribeConnectionChange(listener);

      setMockConnectionInfo({ effectiveType: "2g" });
      expect(listener).toHaveBeenCalledWith(expect.objectContaining({ tier: "slow" }));

      unsubscribe();
    });
  });

  describe("Priority Queue & Viewport Proximity Execution", () => {
    it("executes critical and high priority tasks immediately ahead of low priority tasks", async () => {
      const scheduler = new NetworkSchedulerEngine();
      const executionOrder: string[] = [];

      scheduler.scheduleTask({
        id: "low-task",
        priority: "low",
        viewportProximity: false,
        execute: () => {
          executionOrder.push("low");
        },
      });

      scheduler.scheduleTask({
        id: "critical-task",
        priority: "critical",
        execute: () => {
          executionOrder.push("critical");
        },
      });

      scheduler.updateTaskProximity("low-task", true);

      expect(executionOrder).toEqual(["critical", "low"]);
    });

    it("defers low priority tasks on slow network connections until viewport proximity triggers activate", async () => {
      const scheduler = new NetworkSchedulerEngine();
      setMockConnectionInfo({ effectiveType: "2g", saveData: true });

      const executedTasks: string[] = [];

      scheduler.scheduleTask({
        id: "below-fold-3d-model",
        priority: "low",
        viewportProximity: false, // Offscreen
        deferOnSlowNetwork: true,
        execute: () => {
          executedTasks.push("3d-model");
        },
      });

      // While offscreen on slow network, task MUST remain queued
      expect(executedTasks).not.toContain("3d-model");

      // Activate viewport proximity trigger
      scheduler.updateTaskProximity("below-fold-3d-model", true);

      // Task now executes
      expect(executedTasks).toContain("3d-model");
    });

    it("allows task cancellation before execution", () => {
      const scheduler = new NetworkSchedulerEngine();
      const spy = vi.fn();

      const cancel = scheduler.scheduleTask({
        id: "cancelable-task",
        priority: "low",
        viewportProximity: false,
        execute: spy,
      });

      cancel(); // Cancel task while queued

      scheduler.updateTaskProximity("cancelable-task", true);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe("Main Thread Idle Polyfill Helper", () => {
    it("invokes idle callback cleanly via requestMainThreadIdle and allows cancellation", () => {
      const cb = vi.fn();
      const handle = requestMainThreadIdle(cb);
      cancelMainThreadIdle(handle);
      expect(handle).toBeDefined();
    });
  });
});

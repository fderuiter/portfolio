import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  inspectClientCapabilities,
  inspectNetworkConnection,
  setMockDeviceCapabilities,
  BASELINE_DESKTOP_BUDGET,
  MOBILE_CONSTRAINED_BUDGET,
  MOBILE_MEDIUM_BUDGET,
} from "@/lib/adaptive-resource";

describe("Adaptive Runtime Resource Controller", () => {
  beforeEach(() => {
    setMockDeviceCapabilities(null);
  });

  afterEach(() => {
    setMockDeviceCapabilities(null);
  });

  describe("Network Connection Quality Inspection", () => {
    it("detects 4G high-speed unconstrained connections cleanly", () => {
      setMockDeviceCapabilities({
        connection: {
          effectiveType: "4g",
          saveData: false,
          downlink: 10,
          rtt: 50,
          isCellularOrConstrained: false,
        },
      });

      const conn = inspectNetworkConnection();
      expect(conn.effectiveType).toBe("4g");
      expect(conn.isCellularOrConstrained).toBe(false);
    });

    it("identifies 3G/2G and saveData constrained connections as cellular/constrained", () => {
      setMockDeviceCapabilities({
        connection: {
          effectiveType: "3g",
          saveData: true,
          downlink: 1.2,
          rtt: 350,
          isCellularOrConstrained: true,
        },
      });

      const conn = inspectNetworkConnection();
      expect(conn.effectiveType).toBe("3g");
      expect(conn.saveData).toBe(true);
      expect(conn.isCellularOrConstrained).toBe(true);
    });
  });

  describe("Device Capability & Viewport Classification", () => {
    it("classifies desktop viewports with fine pointers as high tier with desktop asset budget", () => {
      setMockDeviceCapabilities({
        isMobileViewport: false,
        hasTouch: false,
        isCoarsePointer: false,
        deviceMemoryGb: 8,
        hardwareConcurrency: 8,
        connection: {
          effectiveType: "4g",
          saveData: false,
          downlink: 10,
          rtt: 40,
          isCellularOrConstrained: false,
        },
      });

      const caps = inspectClientCapabilities();
      expect(caps.isMobileViewport).toBe(false);
      expect(caps.deviceTier).toBe("high");
      expect(caps.shouldDefer3D).toBe(false);
      expect(caps.assetBudget).toEqual(BASELINE_DESKTOP_BUDGET);
    });

    it("defers 3D assets and enforces constrained asset budget on mobile cellular viewports", () => {
      setMockDeviceCapabilities({
        isMobileViewport: true,
        hasTouch: true,
        isCoarsePointer: true,
        deviceMemoryGb: 2,
        hardwareConcurrency: 2,
        connection: {
          effectiveType: "3g",
          saveData: false,
          downlink: 1.5,
          rtt: 320,
          isCellularOrConstrained: true,
        },
      });

      const caps = inspectClientCapabilities();
      expect(caps.isMobileViewport).toBe(true);
      expect(caps.hasTouch).toBe(true);
      expect(caps.deviceTier).toBe("low");
      expect(caps.shouldDefer3D).toBe(true);
      expect(caps.assetBudget).toEqual(MOBILE_CONSTRAINED_BUDGET);

      // Verify mobile initial JS payload budget is at least 40% lower than desktop baseline
      const mobileMaxGzip = caps.assetBudget.maxInitialSharedGzipBytes;
      const desktopMaxGzip = BASELINE_DESKTOP_BUDGET.maxInitialSharedGzipBytes;
      const reductionRatio = (desktopMaxGzip - mobileMaxGzip) / desktopMaxGzip;
      expect(reductionRatio).toBeGreaterThanOrEqual(0.4);
    });

    it("assigns medium asset budget for mobile viewports on 4G connections", () => {
      setMockDeviceCapabilities({
        isMobileViewport: true,
        hasTouch: true,
        isCoarsePointer: true,
        deviceMemoryGb: 4,
        hardwareConcurrency: 4,
        connection: {
          effectiveType: "4g",
          saveData: false,
          downlink: 8,
          rtt: 60,
          isCellularOrConstrained: false,
        },
      });

      const caps = inspectClientCapabilities();
      expect(caps.isMobileViewport).toBe(true);
      expect(caps.shouldDefer3D).toBe(true);
      expect(caps.assetBudget).toEqual(MOBILE_MEDIUM_BUDGET);
    });
  });
});

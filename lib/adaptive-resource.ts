/**
 * Adaptive Runtime Resource Controller
 * Inspects client connection speeds, network latency, device hardware tiers,
 * and touch capabilities to determine dynamic asset delivery budgets and 3D deferral strategy.
 */

export type NetworkEffectiveType = "slow-2g" | "2g" | "3g" | "4g" | "unknown";
export type DeviceTier = "low" | "medium" | "high";

export interface NetworkConnectionInfo {
  effectiveType: NetworkEffectiveType;
  saveData: boolean;
  downlink: number; // Mbps
  rtt: number; // milliseconds
  isCellularOrConstrained: boolean;
}

export interface ClientDeviceCapabilities {
  isMobileViewport: boolean;
  hasTouch: boolean;
  isCoarsePointer: boolean;
  deviceMemoryGb: number;
  hardwareConcurrency: number;
  connection: NetworkConnectionInfo;
  deviceTier: DeviceTier;
  shouldDefer3D: boolean;
  assetBudget: {
    maxInitialSharedGzipBytes: number;
    maxSingleChunkGzipBytes: number;
  };
}

export const BASELINE_DESKTOP_BUDGET = {
  maxInitialSharedGzipBytes: 400 * 1024, // 400 KB
  maxSingleChunkGzipBytes: 350 * 1024, // 350 KB
};

export const MOBILE_MEDIUM_BUDGET = {
  maxInitialSharedGzipBytes: 250 * 1024, // 250 KB
  maxSingleChunkGzipBytes: 200 * 1024, // 200 KB
};

export const MOBILE_CONSTRAINED_BUDGET = {
  maxInitialSharedGzipBytes: 150 * 1024, // 150 KB (>= 60% reduction vs 400KB desktop baseline)
  maxSingleChunkGzipBytes: 120 * 1024, // 120 KB
};

/**
 * Inspect Network Connection state from navigator.connection.
 */
export function inspectNetworkConnection(): NetworkConnectionInfo {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {
      effectiveType: "4g",
      saveData: false,
      downlink: 10,
      rtt: 50,
      isCellularOrConstrained: false,
    };
  }

  // Support global test override
  const mockCap = (globalThis as unknown as { __mockAdaptiveCapabilities?: Partial<ClientDeviceCapabilities> }).__mockAdaptiveCapabilities;
  if (mockCap?.connection) {
    return mockCap.connection;
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const navConn =
    (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  if (!navConn) {
    return {
      effectiveType: "4g",
      saveData: false,
      downlink: 10,
      rtt: 50,
      isCellularOrConstrained: false,
    };
  }

  const effectiveType: NetworkEffectiveType =
    navConn.effectiveType || "4g";
  const saveData = Boolean(navConn.saveData);
  const downlink = typeof navConn.downlink === "number" ? navConn.downlink : 10;
  const rtt = typeof navConn.rtt === "number" ? navConn.rtt : 50;

  const isCellularOrConstrained =
    effectiveType === "slow-2g" ||
    effectiveType === "2g" ||
    effectiveType === "3g" ||
    saveData ||
    downlink < 2.0 ||
    rtt > 300;

  return {
    effectiveType,
    saveData,
    downlink,
    rtt,
    isCellularOrConstrained,
  };
}

/**
 * Inspect client device hardware capabilities, viewport dimensions, and touch pointer inputs.
 */
export function inspectClientCapabilities(): ClientDeviceCapabilities {
  // Support global test overrides
  const mockCap = (globalThis as unknown as { __mockAdaptiveCapabilities?: Partial<ClientDeviceCapabilities> }).__mockAdaptiveCapabilities;

  if (typeof window === "undefined" || typeof navigator === "undefined") {
    const conn = inspectNetworkConnection();
    return {
      isMobileViewport: false,
      hasTouch: false,
      isCoarsePointer: false,
      deviceMemoryGb: 8,
      hardwareConcurrency: 8,
      connection: conn,
      deviceTier: "high",
      shouldDefer3D: false,
      assetBudget: BASELINE_DESKTOP_BUDGET,
      ...mockCap,
    };
  }

  const conn = mockCap?.connection || inspectNetworkConnection();

  const windowWidth = typeof window.innerWidth === "number" && window.innerWidth > 0 ? window.innerWidth : 1024;
  const isMediaMobile = typeof window.matchMedia === "function" && window.innerWidth > 0 && window.matchMedia("(max-width: 768px)").matches;
  const isMobileViewport = mockCap?.isMobileViewport ?? (
    (typeof window.innerWidth === "number" && window.innerWidth > 0 && window.innerWidth <= 768) || isMediaMobile
  );

  const isCoarsePointer = mockCap?.isCoarsePointer ?? (typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches);
  const hasTouch = mockCap?.hasTouch ?? (
    isCoarsePointer ||
    (isMobileViewport && ("ontouchstart" in window || (navigator.maxTouchPoints || 0) > 0))
  );

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const deviceMemoryGb = mockCap?.deviceMemoryGb ?? (typeof (navigator as any).deviceMemory === "number" ? (navigator as any).deviceMemory : 4);
  /* eslint-enable @typescript-eslint/no-explicit-any */
  const hardwareConcurrency = mockCap?.hardwareConcurrency ?? (typeof navigator.hardwareConcurrency === "number" ? navigator.hardwareConcurrency : 4);

  // Compute Device Tier
  let deviceTier: DeviceTier = "high";
  if (conn.isCellularOrConstrained || deviceMemoryGb <= 2 || hardwareConcurrency <= 2) {
    deviceTier = "low";
  } else if (isMobileViewport || deviceMemoryGb <= 4 || hardwareConcurrency <= 4) {
    deviceTier = "medium";
  }
  if (mockCap?.deviceTier) {
    deviceTier = mockCap.deviceTier;
  }

  // 3D Deferral Strategy:
  // Mobile viewports (width <= 768px) or touch devices on constrained/cellular connections DEFER 3D assets until user tap.
  // Desktop viewports maintain immediate 3D scene rendering.
  const shouldDefer3D = mockCap?.shouldDefer3D ?? (
    isMobileViewport ||
    (hasTouch && (conn.isCellularOrConstrained || conn.saveData || deviceTier === "low"))
  );

  // Dynamic Asset Budget Thresholds
  let assetBudget = BASELINE_DESKTOP_BUDGET;
  if (deviceTier === "low" || conn.isCellularOrConstrained) {
    assetBudget = MOBILE_CONSTRAINED_BUDGET;
  } else if (deviceTier === "medium" || isMobileViewport) {
    assetBudget = MOBILE_MEDIUM_BUDGET;
  }
  if (mockCap?.assetBudget) {
    assetBudget = mockCap.assetBudget;
  }

  return {
    isMobileViewport,
    hasTouch,
    isCoarsePointer,
    deviceMemoryGb,
    hardwareConcurrency,
    connection: conn,
    deviceTier,
    shouldDefer3D,
    assetBudget,
  };
}

/**
 * Configure global capability overrides for test isolation.
 */
export function setMockDeviceCapabilities(capabilities: Partial<ClientDeviceCapabilities> | null): void {
  if (capabilities === null) {
    delete (globalThis as unknown as { __mockAdaptiveCapabilities?: Partial<ClientDeviceCapabilities> }).__mockAdaptiveCapabilities;
  } else {
    (globalThis as unknown as { __mockAdaptiveCapabilities?: Partial<ClientDeviceCapabilities> }).__mockAdaptiveCapabilities = capabilities;
  }
}

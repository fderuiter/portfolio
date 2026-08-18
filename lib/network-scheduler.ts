/**
 * Viewport-Aware Network Scheduler Engine
 * Manages connection-tier detection, main-thread idle callback queueing,
 * and priority-based media asset download scheduling.
 */

export type ConnectionTier = "fast" | "slow";
export type TaskPriority = "critical" | "high" | "medium" | "low";
export type TaskStatus = "idle" | "queued" | "executing" | "completed" | "failed" | "cancelled";

export interface ConnectionInfo {
  effectiveType: "slow-2g" | "2g" | "3g" | "4g" | "unknown";
  saveData: boolean;
  downlink: number; // Mbps
  rtt: number;      // ms
  tier: ConnectionTier;
}

export interface TaskOptions<T = unknown> {
  id: string;
  priority?: TaskPriority;
  viewportProximity?: boolean;
  deferOnSlowNetwork?: boolean;
  requiresIdle?: boolean;
  execute: () => Promise<T> | T;
  onSuccess?: (result: T) => void;
  onError?: (error: unknown) => void;
}

export interface ScheduledTaskInternal<T = unknown> {
  id: string;
  priority: TaskPriority;
  viewportProximity: boolean;
  deferOnSlowNetwork: boolean;
  requiresIdle: boolean;
  execute: () => Promise<T> | T;
  onSuccess?: (result: T) => void;
  onError?: (error: unknown) => void;
  status: TaskStatus;
  queuedAt: number;
}

const PRIORITY_WEIGHTS: Record<TaskPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

let mockConnectionInfo: ConnectionInfo | null = null;
const connectionChangeListeners = new Set<(info: ConnectionInfo) => void>();

let cachedConnectionInfo: ConnectionInfo | null = null;

/**
 * Detect current connection quality tier and network stats
 */
export function getConnectionInfo(): ConnectionInfo {
  if (mockConnectionInfo) {
    return mockConnectionInfo;
  }

  if (typeof window === "undefined" || typeof navigator === "undefined") {
    if (!cachedConnectionInfo) {
      cachedConnectionInfo = {
        effectiveType: "4g",
        saveData: false,
        downlink: 10,
        rtt: 50,
        tier: "fast",
      };
    }
    return cachedConnectionInfo;
  }

  // Support standard and vendor-prefixed Network Information API
  const nav = navigator as unknown as {
    connection?: {
      effectiveType?: string;
      saveData?: boolean;
      downlink?: number;
      rtt?: number;
      addEventListener?: (type: string, listener: () => void) => void;
      removeEventListener?: (type: string, listener: () => void) => void;
    };
    mozConnection?: unknown;
    webkitConnection?: unknown;
  };

  const conn = nav.connection;
  if (!conn) {
    if (!cachedConnectionInfo) {
      cachedConnectionInfo = {
        effectiveType: "4g",
        saveData: false,
        downlink: 10,
        rtt: 50,
        tier: "fast",
      };
    }
    return cachedConnectionInfo;
  }

  const effectiveType = (conn.effectiveType as ConnectionInfo["effectiveType"]) || "4g";
  const saveData = Boolean(conn.saveData);
  const downlink = typeof conn.downlink === "number" ? conn.downlink : 10;
  const rtt = typeof conn.rtt === "number" ? conn.rtt : 50;

  // Determine connection quality tier
  const isSlow =
    saveData ||
    effectiveType === "slow-2g" ||
    effectiveType === "2g" ||
    effectiveType === "3g" ||
    downlink < 1.5 ||
    rtt > 500;

  const tier: ConnectionTier = isSlow ? "slow" : "fast";

  if (
    !cachedConnectionInfo ||
    cachedConnectionInfo.effectiveType !== effectiveType ||
    cachedConnectionInfo.saveData !== saveData ||
    cachedConnectionInfo.downlink !== downlink ||
    cachedConnectionInfo.rtt !== rtt ||
    cachedConnectionInfo.tier !== tier
  ) {
    cachedConnectionInfo = {
      effectiveType,
      saveData,
      downlink,
      rtt,
      tier,
    };
  }

  return cachedConnectionInfo;
}

/**
 * Override connection info for testing / developer scenarios
 */
export function setMockConnectionInfo(mock: Partial<ConnectionInfo> | null): void {
  if (mock === null) {
    mockConnectionInfo = null;
    cachedConnectionInfo = null;
  } else {
    const base = getConnectionInfo();
    const effectiveType = mock.effectiveType ?? base.effectiveType;
    const saveData = mock.saveData ?? base.saveData;
    const downlink = mock.downlink ?? base.downlink;
    const rtt = mock.rtt ?? base.rtt;
    const isSlow =
      saveData ||
      effectiveType === "slow-2g" ||
      effectiveType === "2g" ||
      effectiveType === "3g" ||
      downlink < 1.5 ||
      rtt > 500;

    mockConnectionInfo = {
      effectiveType,
      saveData,
      downlink,
      rtt,
      tier: mock.tier ?? (isSlow ? "slow" : "fast"),
    };
    cachedConnectionInfo = mockConnectionInfo;
  }

  notifyConnectionListeners();
}

/**
 * Listen for network connection quality changes
 */
export function subscribeConnectionChange(listener: (info: ConnectionInfo) => void): () => void {
  connectionChangeListeners.add(listener);

  if (typeof window !== "undefined" && typeof navigator !== "undefined") {
    const nav = navigator as unknown as {
      connection?: {
        addEventListener?: (type: string, listener: () => void) => void;
        removeEventListener?: (type: string, listener: () => void) => void;
      };
    };
    const handler = () => {
      listener(getConnectionInfo());
    };
    nav.connection?.addEventListener?.("change", handler);

    return () => {
      connectionChangeListeners.delete(listener);
      nav.connection?.removeEventListener?.("change", handler);
    };
  }

  return () => {
    connectionChangeListeners.delete(listener);
  };
}

function notifyConnectionListeners() {
  const current = getConnectionInfo();
  connectionChangeListeners.forEach((fn) => fn(current));
}

/**
 * Main Thread Idle Callback Wrapper with Polyfill Fallback
 */
export function requestMainThreadIdle(callback: () => void, timeoutMs = 2000): number {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    return (window as unknown as { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(
      callback,
      { timeout: timeoutMs }
    );
  }
  return setTimeout(callback, 16) as unknown as number;
}

export function cancelMainThreadIdle(handle: number): void {
  if (typeof window !== "undefined" && "cancelIdleCallback" in window) {
    (window as unknown as { cancelIdleCallback: (handle: number) => void }).cancelIdleCallback(handle);
  } else {
    clearTimeout(handle);
  }
}

/**
 * Network Scheduler Core Engine Class
 */
export class NetworkSchedulerEngine {
  private tasks = new Map<string, ScheduledTaskInternal>();
  private activeCount = 0;
  private maxConcurrent = 3;
  private isProcessing = false;

  constructor() {
    subscribeConnectionChange(() => {
      this.processQueue();
    });
  }

  public scheduleTask<T>(options: TaskOptions<T>): () => void {
    const priority = options.priority || "low";
    const task: ScheduledTaskInternal<T> = {
      id: options.id,
      priority,
      viewportProximity: options.viewportProximity ?? (priority === "critical" || priority === "high"),
      deferOnSlowNetwork: options.deferOnSlowNetwork ?? (priority === "low" || priority === "medium"),
      requiresIdle: options.requiresIdle ?? false,
      execute: options.execute,
      onSuccess: options.onSuccess as ScheduledTaskInternal["onSuccess"],
      onError: options.onError,
      status: "queued",
      queuedAt: Date.now(),
    };

    this.tasks.set(task.id, task as ScheduledTaskInternal);
    this.processQueue();

    return () => {
      this.cancelTask(options.id);
    };
  }

  public updateTaskProximity(id: string, inProximity: boolean): void {
    const task = this.tasks.get(id);
    if (task) {
      task.viewportProximity = inProximity;
      if (inProximity && task.status === "queued") {
        this.processQueue();
      }
    }
  }

  public cancelTask(id: string): void {
    const task = this.tasks.get(id);
    if (task && (task.status === "queued" || task.status === "executing")) {
      task.status = "cancelled";
      this.tasks.delete(id);
    }
  }

  public getTaskStatus(id: string): TaskStatus | undefined {
    return this.tasks.get(id)?.status;
  }

  public processQueue(): void {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const conn = getConnectionInfo();
      const queuedTasks = Array.from(this.tasks.values()).filter((t) => t.status === "queued");

      // Sort queued tasks by priority weight, then by proximity, then queuedAt time
      queuedTasks.sort((a, b) => {
        const weightDiff = PRIORITY_WEIGHTS[a.priority] - PRIORITY_WEIGHTS[b.priority];
        if (weightDiff !== 0) return weightDiff;
        if (a.viewportProximity !== b.viewportProximity) {
          return a.viewportProximity ? -1 : 1;
        }
        return a.queuedAt - b.queuedAt;
      });

      for (const task of queuedTasks) {
        if (this.activeCount >= this.maxConcurrent && task.priority !== "critical") {
          break;
        }

        // Determine if task is ready to execute based on network tier and viewport proximity
        const isReady = this.isTaskReadyToExecute(task, conn);
        if (isReady) {
          this.executeTask(task);
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private isTaskReadyToExecute(task: ScheduledTaskInternal, conn: ConnectionInfo): boolean {
    // Critical & High priority tasks execute immediately
    if (task.priority === "critical" || task.priority === "high") {
      return true;
    }

    // On constrained/slow connections, low/medium priority tasks require viewport proximity
    if (conn.tier === "slow" && task.deferOnSlowNetwork) {
      return task.viewportProximity;
    }

    // On fast connections, low priority heavy tasks require viewport proximity or idle queueing
    if (task.priority === "low") {
      return task.viewportProximity;
    }

    return true;
  }

  private executeTask(task: ScheduledTaskInternal): void {
    task.status = "executing";
    this.activeCount++;

    const run = async () => {
      try {
        const result = await task.execute();
        if (task.status === "executing") {
          task.status = "completed";
          task.onSuccess?.(result);
        }
      } catch (err) {
        if (task.status === "executing") {
          task.status = "failed";
          task.onError?.(err);
        }
      } finally {
        this.activeCount--;
        this.tasks.delete(task.id);
        this.processQueue();
      }
    };

    if (task.requiresIdle && typeof window !== "undefined") {
      requestMainThreadIdle(() => {
        run();
      });
    } else {
      run();
    }
  }

  public clearAll(): void {
    this.tasks.clear();
    this.activeCount = 0;
  }
}

// Global Singleton Instance
export const globalNetworkScheduler = new NetworkSchedulerEngine();

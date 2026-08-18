/**
 * Viewport-Aware Network Scheduler & Media Budget Engine
 * Client-side runtime scheduling, network connection inspection, and thread-idle task prioritization.
 */

export type MediaPriority = 0 | 1 | 2 | 3;

export const MEDIA_PRIORITY = {
  CRITICAL_ABOVE_THE_FOLD: 0 as MediaPriority,
  HIGH: 1 as MediaPriority,
  MEDIUM: 2 as MediaPriority,
  LOW: 3 as MediaPriority,
} as const;

export type MediaLoadStatus = "QUEUED" | "DEFERRED" | "LOADING" | "COMPLETED" | "FAILED";

export interface NetworkConnectionInfo {
  isConstrained: boolean;
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
  maxConcurrentDownloads: number;
}

export interface ScheduledMediaOptions {
  priority?: MediaPriority;
  isAboveTheFold?: boolean;
  requiresViewportProximity?: boolean;
  isNearViewport?: boolean;
  onStatusChange?: (status: MediaLoadStatus) => void;
}

export interface QueueTask<T = unknown> {
  id: string;
  priority: MediaPriority;
  isAboveTheFold: boolean;
  requiresViewportProximity: boolean;
  isNearViewport: boolean;
  status: MediaLoadStatus;
  loadFn: () => Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
  onStatusChange?: (status: MediaLoadStatus) => void;
}

/**
 * Inspects device connection bandwidth and data-saver preference.
 */
export function getNetworkConnectionInfo(): NetworkConnectionInfo {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {
      isConstrained: false,
      effectiveType: "4g",
      downlink: 10,
      rtt: 50,
      saveData: false,
      maxConcurrentDownloads: 3,
    };
  }

  const nav = navigator as Navigator & {
    connection?: {
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
      saveData?: boolean;
      addEventListener?: (type: string, listener: () => void) => void;
    };
    mozConnection?: {
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
      saveData?: boolean;
    };
    webkitConnection?: {
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
      saveData?: boolean;
    };
  };

  const conn = nav.connection || nav.mozConnection || nav.webkitConnection;

  if (!conn) {
    return {
      isConstrained: false,
      effectiveType: "4g",
      downlink: 10,
      rtt: 50,
      saveData: false,
      maxConcurrentDownloads: 3,
    };
  }

  const effectiveType = conn.effectiveType || "4g";
  const downlink = typeof conn.downlink === "number" ? conn.downlink : 10;
  const rtt = typeof conn.rtt === "number" ? conn.rtt : 50;
  const saveData = Boolean(conn.saveData);

  const isConstrained =
    effectiveType === "slow-2g" ||
    effectiveType === "2g" ||
    effectiveType === "3g" ||
    saveData ||
    downlink < 1.5 ||
    rtt > 300;

  return {
    isConstrained,
    effectiveType,
    downlink,
    rtt,
    saveData,
    maxConcurrentDownloads: isConstrained ? 1 : 3,
  };
}

export class MediaSchedulerEngine {
  private queue: QueueTask[] = [];
  private activeCount = 0;
  private subscribers: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      const nav = navigator as Navigator & {
        connection?: { addEventListener?: (type: string, listener: () => void) => void };
      };
      if (nav.connection?.addEventListener) {
        nav.connection.addEventListener("change", () => this.processQueue());
      }
    }
  }

  public subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(): void {
    for (const callback of this.subscribers) {
      try {
        callback();
      } catch {
        // Ignore subscriber exceptions
      }
    }
  }

  /**
   * Schedules a media asset download task.
   */
  public schedule<T>(
    id: string,
    loadFn: () => Promise<T>,
    options: ScheduledMediaOptions = {}
  ): Promise<T> {
    const priority = options.priority ?? (options.isAboveTheFold ? MEDIA_PRIORITY.CRITICAL_ABOVE_THE_FOLD : MEDIA_PRIORITY.MEDIUM);
    const isAboveTheFold = Boolean(options.isAboveTheFold);
    const requiresViewportProximity = options.requiresViewportProximity ?? !isAboveTheFold;
    const isNearViewport = options.isNearViewport ?? isAboveTheFold;

    // Check if task already exists in queue or active
    const existing = this.queue.find((t) => t.id === id);
    if (existing) {
      existing.priority = Math.min(existing.priority, priority) as MediaPriority;
      existing.isNearViewport = existing.isNearViewport || isNearViewport;
      this.processQueue();
      return new Promise<T>((resolve, reject) => {
        const origResolve = existing.resolve;
        const origReject = existing.reject;
        existing.resolve = (val) => {
          origResolve(val);
          resolve(val as T);
        };
        existing.reject = (err) => {
          origReject(err);
          reject(err);
        };
      });
    }

    return new Promise<T>((resolve, reject) => {
      const task: QueueTask<T> = {
        id,
        priority,
        isAboveTheFold,
        requiresViewportProximity,
        isNearViewport,
        status: "QUEUED",
        loadFn,
        resolve: resolve as (val: unknown) => void,
        reject,
        onStatusChange: options.onStatusChange,
      };

      this.queue.push(task as QueueTask);
      this.updateTaskStatus(task as QueueTask, "QUEUED");
      this.processQueue();
    });
  }

  /**
   * Updates task parameters (e.g. when element enters viewport proximity).
   */
  public updateTaskProximity(id: string, isNearViewport: boolean): void {
    const task = this.queue.find((t) => t.id === id);
    if (task) {
      task.isNearViewport = isNearViewport;
      this.processQueue();
    }
  }

  private updateTaskStatus(task: QueueTask, status: MediaLoadStatus): void {
    if (task.status !== status) {
      task.status = status;
      if (task.onStatusChange) {
        try {
          task.onStatusChange(status);
        } catch {
          // Guard status callback
        }
      }
      this.notifySubscribers();
    }
  }

  /**
   * Evaluates pending tasks and processes eligible downloads.
   */
  public processQueue(): void {
    if (this.queue.length === 0) return;

    const connection = getNetworkConnectionInfo();
    const maxAllowed = connection.maxConcurrentDownloads;

    // Sort queue by priority ascending (0 highest, 3 lowest)
    this.queue.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      if (a.isNearViewport !== b.isNearViewport) return a.isNearViewport ? -1 : 1;
      return 0;
    });

    const runNext = () => {
      if (this.activeCount >= maxAllowed) return;

      const eligibleIndex = this.queue.findIndex((task) => {
        if (task.status === "LOADING") return false;

        // Above the fold or critical priority: load immediately
        if (task.isAboveTheFold || task.priority === MEDIA_PRIORITY.CRITICAL_ABOVE_THE_FOLD) {
          return true;
        }

        // Below the fold: requires viewport proximity or fast connection
        if (task.requiresViewportProximity && !task.isNearViewport) {
          if (connection.isConstrained) {
            this.updateTaskStatus(task, "DEFERRED");
            return false;
          }
        }

        return true;
      });

      if (eligibleIndex === -1) return;

      const [task] = this.queue.splice(eligibleIndex, 1);
      this.executeTask(task);
    };

    // Execute with requestIdleCallback if constrained connection or low priority
    const hasIdleCallback = typeof window !== "undefined" && typeof window.requestIdleCallback === "function";

    if (connection.isConstrained && hasIdleCallback) {
      window.requestIdleCallback(
        () => {
          runNext();
        },
        { timeout: 1000 }
      );
    } else {
      runNext();
    }
  }

  private async executeTask(task: QueueTask): Promise<void> {
    this.activeCount++;
    this.updateTaskStatus(task, "LOADING");

    try {
      const result = await task.loadFn();
      this.updateTaskStatus(task, "COMPLETED");
      task.resolve(result);
    } catch (err) {
      this.updateTaskStatus(task, "FAILED");
      task.reject(err);
    } finally {
      this.activeCount = Math.max(0, this.activeCount - 1);
      this.processQueue();
    }
  }

  public getQueueSnapshot(): {
    activeCount: number;
    queuedCount: number;
    tasks: Array<{ id: string; priority: MediaPriority; status: MediaLoadStatus; isNearViewport: boolean }>;
  } {
    return {
      activeCount: this.activeCount,
      queuedCount: this.queue.length,
      tasks: this.queue.map((t) => ({
        id: t.id,
        priority: t.priority,
        status: t.status,
        isNearViewport: t.isNearViewport,
      })),
    };
  }

  public clearQueue(): void {
    this.queue = [];
    this.activeCount = 0;
    this.notifySubscribers();
  }
}

export const mediaScheduler = new MediaSchedulerEngine();

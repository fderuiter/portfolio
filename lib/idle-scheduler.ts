/**
 * Browser Idle Task Scheduler Utility
 * Schedules non-critical computational tasks during browser idle periods
 * using requestIdleCallback with setTimeout fallback for seamless cross-browser support.
 */

export type IdleTaskCallback = (deadline?: {
  didTimeout: boolean;
  timeRemaining: () => number;
}) => void;

export interface IdleTaskOptions {
  timeout?: number;
}

/**
 * Schedule a task during browser idle frames.
 *
 * @param callback Task execution callback function.
 * @param options Optional configuration including timeout deadline.
 * @returns Cancellation function.
 */
export function scheduleIdleTask(
  callback: IdleTaskCallback,
  options: IdleTaskOptions = { timeout: 2000 }
): () => void {
  if (typeof window !== "undefined" && typeof window.requestIdleCallback === "function") {
    const handle = window.requestIdleCallback(
      (deadline) => callback(deadline),
      { timeout: options.timeout ?? 2000 }
    );
    return () => {
      if (typeof window !== "undefined" && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(handle);
      }
    };
  } else {
    const timer = setTimeout(() => {
      callback({
        didTimeout: true,
        timeRemaining: () => 0,
      });
    }, 50);
    return () => clearTimeout(timer);
  }
}

/**
 * Cancel a previously scheduled idle task.
 *
 * @param cancelFn Cancellation function returned by scheduleIdleTask.
 */
export function cancelIdleTask(cancelFn?: () => void): void {
  if (cancelFn) {
    cancelFn();
  }
}

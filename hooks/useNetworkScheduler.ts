"use client";

import { useEffect, useRef, useState, useCallback, useSyncExternalStore } from "react";
import {
  getConnectionInfo,
  subscribeConnectionChange,
  globalNetworkScheduler,
  requestMainThreadIdle,
  cancelMainThreadIdle,
  type ConnectionInfo,
  type TaskOptions,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/network-scheduler";

const subscribeConnection = (callback: () => void) => {
  return subscribeConnectionChange(() => callback());
};

const getConnectionSnapshot = (): ConnectionInfo => {
  return getConnectionInfo();
};

const getServerConnectionSnapshot = (): ConnectionInfo => {
  return {
    effectiveType: "4g",
    saveData: false,
    downlink: 10,
    rtt: 50,
    tier: "fast",
  };
};

/**
 * React Hook for connection state and task scheduling
 */
export function useNetworkScheduler() {
  const connection = useSyncExternalStore(
    subscribeConnection,
    getConnectionSnapshot,
    getServerConnectionSnapshot
  );

  const scheduleTask = useCallback(<T>(options: TaskOptions<T>) => {
    return globalNetworkScheduler.scheduleTask(options);
  }, []);

  const cancelTask = useCallback((id: string) => {
    globalNetworkScheduler.cancelTask(id);
  }, []);

  const updateProximity = useCallback((id: string, inProximity: boolean) => {
    globalNetworkScheduler.updateTaskProximity(id, inProximity);
  }, []);

  return {
    connection,
    isSlowConnection: connection.tier === "slow",
    scheduleTask,
    cancelTask,
    updateProximity,
    requestIdle: requestMainThreadIdle,
    cancelIdle: cancelMainThreadIdle,
  };
}

export interface UseViewportSchedulerOptions {
  id: string;
  priority?: TaskPriority;
  rootMargin?: string;
  deferOnSlowNetwork?: boolean;
  threshold?: number | number[];
  disabled?: boolean;
}

/**
 * React Hook for viewport-driven asset scheduling with connection awareness
 */
export function useViewportScheduler<T = unknown>(
  loadTask: () => Promise<T> | T,
  options: UseViewportSchedulerOptions
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const connection = useSyncExternalStore(
    subscribeConnection,
    getConnectionSnapshot,
    getServerConnectionSnapshot
  );

  const [status, setStatus] = useState<TaskStatus>("queued");
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [isInViewport, setIsInViewport] = useState<boolean>(() => {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      return true;
    }
    return false;
  });

  const priority = options.priority || "low";
  const deferOnSlowNetwork = options.deferOnSlowNetwork ?? true;

  // Track IntersectionObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof IntersectionObserver === "undefined") {
      setIsInViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInViewport(true);
          }
        });
      },
      {
        rootMargin: options.rootMargin || "200px",
        threshold: options.threshold || 0,
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [options.rootMargin, options.threshold]);

  // Schedule task when in viewport or critical/high priority
  useEffect(() => {
    if (options.disabled) return;

    let cancelled = false;

    const cancel = globalNetworkScheduler.scheduleTask<T>({
      id: options.id,
      priority,
      viewportProximity: isInViewport,
      deferOnSlowNetwork,
      execute: loadTask,
      onSuccess: (res) => {
        if (!cancelled) {
          setData(res);
          setStatus("completed");
        }
      },
      onError: (err) => {
        if (!cancelled) {
          setError(err);
          setStatus("failed");
        }
      },
    });

    return () => {
      cancelled = true;
      cancel();
    };
  }, [options.id, priority, isInViewport, deferOnSlowNetwork, options.disabled, loadTask]);

  // Update proximity when isInViewport changes
  useEffect(() => {
    globalNetworkScheduler.updateTaskProximity(options.id, isInViewport);
  }, [options.id, isInViewport]);

  return {
    containerRef,
    isInViewport,
    shouldLoad: status === "completed" || status === "executing",
    status,
    data,
    error,
    connection,
    isSlowConnection: connection.tier === "slow",
  };
}

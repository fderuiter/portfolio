"use client";

import { useState, useEffect, useRef, useCallback, useId } from "react";
import {
  mediaScheduler,
  getNetworkConnectionInfo,
  MEDIA_PRIORITY,
  type MediaPriority,
  type MediaLoadStatus,
  type NetworkConnectionInfo,
} from "@/lib/media-scheduler";

export interface UseViewportMediaOptions<T = string> {
  priority?: MediaPriority;
  isAboveTheFold?: boolean;
  rootMargin?: string;
  threshold?: number | number[];
  loadFn?: () => Promise<T>;
  enabled?: boolean;
}

export interface UseViewportMediaResult<T = string> {
  containerRef: React.RefObject<HTMLDivElement | null>;
  status: MediaLoadStatus;
  isLoaded: boolean;
  isLoading: boolean;
  isDeferred: boolean;
  isNearViewport: boolean;
  data: T | null;
  error: Error | null;
  connectionInfo: NetworkConnectionInfo;
  triggerLoad: () => void;
}

/**
 * Preloads image URL as an HTMLImageElement
 */
function defaultImageLoader(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!src) {
      resolve("");
      return;
    }
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = (_err) => reject(new Error(`Failed to load media asset: ${src}`));
    img.src = src;
  });
}

export function useViewportMedia<T = string>(
  src?: string,
  options: UseViewportMediaOptions<T> = {}
): UseViewportMediaResult<T> {
  const {
    priority,
    isAboveTheFold = false,
    rootMargin = "200px",
    threshold = 0.01,
    loadFn,
    enabled = true,
  } = options;

  const autoId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<MediaLoadStatus>(isAboveTheFold ? "LOADING" : "QUEUED");
  const [isNearViewport, setIsNearViewport] = useState<boolean>(() => Boolean(isAboveTheFold));
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [connectionInfo] = useState<NetworkConnectionInfo>(() => getNetworkConnectionInfo());

  const computedPriority = priority ?? (isAboveTheFold ? MEDIA_PRIORITY.CRITICAL_ABOVE_THE_FOLD : MEDIA_PRIORITY.MEDIUM);
  const taskId = src ? `media_${src}_${computedPriority}` : `media_custom_${autoId.replace(/:/g, "_")}`;

  // IntersectionObserver for Viewport Proximity Detection
  useEffect(() => {
    if (!enabled || isAboveTheFold || typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }

    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        const isNear = entry.isIntersecting || entry.intersectionRatio > 0;
        setIsNearViewport(isNear);
        if (isNear) {
          mediaScheduler.updateTaskProximity(taskId, true);
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [enabled, isAboveTheFold, rootMargin, threshold, taskId]);

  const executeLoad = useCallback(() => {
    if (!enabled) return;

    const loader = loadFn || (() => defaultImageLoader(src || "") as Promise<T>);

    mediaScheduler
      .schedule<T>(taskId, loader, {
        priority: computedPriority,
        isAboveTheFold,
        requiresViewportProximity: !isAboveTheFold,
        isNearViewport,
        onStatusChange: (s) => setStatus(s),
      })
      .then((result) => {
        setData(result);
        setStatus("COMPLETED");
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error(String(err)));
        setStatus("FAILED");
      });
  }, [enabled, loadFn, src, taskId, computedPriority, isAboveTheFold, isNearViewport]);

  // Trigger load when ready or near viewport
  useEffect(() => {
    if (!enabled) return;

    if (isAboveTheFold || isNearViewport || computedPriority === MEDIA_PRIORITY.CRITICAL_ABOVE_THE_FOLD) {
      executeLoad();
    }
  }, [enabled, isAboveTheFold, isNearViewport, computedPriority, executeLoad]);

  return {
    containerRef,
    status,
    isLoaded: status === "COMPLETED",
    isLoading: status === "LOADING",
    isDeferred: status === "DEFERRED" || status === "QUEUED",
    isNearViewport,
    data,
    error,
    connectionInfo,
    triggerLoad: executeLoad,
  };
}

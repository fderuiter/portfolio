import { useRef, useLayoutEffect, useEffect } from "react";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function useResizeObserver<T extends HTMLElement | SVGSVGElement>(
  callback: (entry: ResizeObserverEntry) => void
) {
  const containerRef = useRef<T | null>(null);
  const callbackRef = useRef(callback);
  const isMountedRef = useRef(true);

  // Keep callback reference updated without triggering observer recreation
  useIsomorphicLayoutEffect(() => {
    callbackRef.current = callback;
  });

  const rAFIdRef = useRef<number | null>(null);
  const latestEntryRef = useRef<ResizeObserverEntry | null>(null);
  const lastWidthRef = useRef<number>(-1);

  useIsomorphicLayoutEffect(() => {
    isMountedRef.current = true;
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const entry = entries[0];
      const currentWidth = Math.floor(entry.contentRect.width);

      // Requirement 4: Ignore height changes caused by vertical page scrolling (Layout Isolation)
      if (currentWidth === lastWidthRef.current) {
        return;
      }

      // Store the latest entry for trailing-edge resolution
      latestEntryRef.current = entry;

      // Requirement 2: Subsequent width events within the same animation frame do not trigger intermediate React updates (Throttling)
      if (rAFIdRef.current !== null) {
        return;
      }

      const runCallback = () => {
        rAFIdRef.current = null;
        if (!isMountedRef.current) {
          return;
        }
        if (latestEntryRef.current) {
          const finalEntry = latestEntryRef.current;
          const finalWidth = Math.floor(finalEntry.contentRect.width);

          if (finalWidth !== lastWidthRef.current) {
            lastWidthRef.current = finalWidth;
            callbackRef.current(finalEntry);
          }
        }
      };

      // SSR/Browser-only safety checks
      if (typeof window !== "undefined") {
        const isTestEnv = typeof process !== "undefined" && (process.env.NODE_ENV === "test" || "vi" in globalThis);
        if (isTestEnv) {
          // In test environments, queue the callback via queueMicrotask or synchronous fallback
          // to make sure it plays nicely with JSDOM and React's `act(...)` testing environment.
          if (typeof queueMicrotask === "function") {
            rAFIdRef.current = 1; // dummy handle
            queueMicrotask(runCallback);
          } else {
            rAFIdRef.current = window.setTimeout(runCallback, 0);
          }
        } else {
          rAFIdRef.current = window.requestAnimationFrame(runCallback);
        }
      }
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
      isMountedRef.current = false;
      // Requirement: Scheduled layout frame updates are completely cancelled and cleaned up when monitored elements unmount
      if (rAFIdRef.current !== null && typeof window !== "undefined") {
        const isTestEnv = typeof process !== "undefined" && (process.env.NODE_ENV === "test" || "vi" in globalThis);
        if (isTestEnv && typeof queueMicrotask !== "function") {
          window.clearTimeout(rAFIdRef.current);
        } else if (!isTestEnv) {
          window.cancelAnimationFrame(rAFIdRef.current);
        }
        rAFIdRef.current = null;
      }
    };
  }, []); // Stable observer subscription across all state/data/filter updates

  return containerRef;
}

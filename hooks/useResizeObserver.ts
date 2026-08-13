import { useRef, useLayoutEffect, useEffect } from "react";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function useResizeObserver<T extends HTMLElement | SVGSVGElement>(
  callback: (entry: ResizeObserverEntry) => void
) {
  const containerRef = useRef<T | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback reference updated without triggering observer recreation
  useIsomorphicLayoutEffect(() => {
    callbackRef.current = callback;
  });

  useIsomorphicLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        callbackRef.current(entry);
      }
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []); // Stable observer subscription across all state/data/filter updates

  return containerRef;
}

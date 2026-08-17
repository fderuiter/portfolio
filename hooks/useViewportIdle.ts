import { useEffect, useRef } from "react";

export function useViewportIdle(
  elementRef: React.RefObject<HTMLElement | null>,
  onVisible?: () => void
) {
  const isVisibleRef = useRef(true);
  const onVisibleRef = useRef(onVisible);

  useEffect(() => {
    onVisibleRef.current = onVisible;
  }, [onVisible]);

  useEffect(() => {
    const element = elementRef.current;
    let isIntersecting = true;
    let isTabVisible = typeof document !== "undefined" ? document.visibilityState === "visible" : true;

    const updateVisibility = () => {
      const nextVisible = isIntersecting && isTabVisible;
      const prevVisible = isVisibleRef.current;
      isVisibleRef.current = nextVisible;

      if (nextVisible && !prevVisible) {
        onVisibleRef.current?.();
      }
    };

    const handleVisibilityChange = () => {
      isTabVisible = document.visibilityState === "visible";
      updateVisibility();
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    let observer: IntersectionObserver | null = null;
    if (typeof window !== "undefined" && "IntersectionObserver" in window && element) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isIntersecting = entry.isIntersecting;
            updateVisibility();
          });
        },
        { threshold: 0 }
      );
      observer.observe(element);
    } else {
      isIntersecting = true;
      updateVisibility();
    }

    // Run initial update
    updateVisibility();

    return () => {
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
      if (observer && element) {
        observer.unobserve(element);
        observer.disconnect();
      }
    };
  }, [elementRef]);

  return isVisibleRef;
}

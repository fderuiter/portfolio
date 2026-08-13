"use client";

import { useEffect } from "react";

/**
 * Custom hook that asynchronously fetches a static ASCII art asset 
 * and prints it in the browser console when the client is idle.
 * This prevents main thread blockage, avoids bundle size increase, 
 * and completely eliminates hydration mismatches.
 */
export function useConsoleArt() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let idleCallbackId: number | null = null;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const fetchAndLog = () => {
      fetch("/ascii-art.txt")
        .then((response) => {
          if (response.ok) {
            return response.text();
          }
          throw new Error("Failed to load");
        })
        .then((text) => {
          console.log(text);
        })
        .catch(() => {
          // Network fetch failures must fail silently without throwing visible console errors
        });
    };

    if ("requestIdleCallback" in window) {
      idleCallbackId = window.requestIdleCallback(() => {
        fetchAndLog();
      });
    } else {
      // Fallback for environments where requestIdleCallback is not available
      timerId = setTimeout(fetchAndLog, 1);
    }

    return () => {
      if (idleCallbackId !== null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleCallbackId);
      }
      if (timerId !== null) {
        clearTimeout(timerId);
      }
    };
  }, []);
}

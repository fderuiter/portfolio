"use client";

import { useEffect } from "react";
import { env } from "@/lib/env";

declare global {
  interface Window {
    serwist?: {
      register: () => Promise<void>;
    };
  }
}

/**
 * Serwist Service Worker Registration Component
 * Registers service worker silently on client mount without blocking global state or UI interactivity.
 */
export function SerwistRegister(): null {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const registerSW = async () => {
      try {
        if (window.serwist !== undefined) {
          await window.serwist.register();
        } else {
          await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        }
      } catch (err) {
        if (env.NODE_ENV !== "production") {
          console.debug("Service worker registration non-critical notice:", err);
        }
      }
    };

    void registerSW();
  }, []);

  return null;
}

"use client";

import { useEffect } from "react";

const ASCII_ART = "\n  _______             _           _      _            _         _____         _ _            \n |  ___| __ ___  __| | ___ _ __(_) ___| | __     __| | ___   |  _  \\ _   _(_) |_ ___ _ __ \n | |_ | '__/ _ \\/ _` |/ _ \\ '__| |/ __| |/ /    / _` |/ _ \\  | |_| | | | | | __/ _ \\ '__|\n |  _|| | |  __/ (_| |  __/ |  | | (__|   <    | (_| |  __/  |  _  / |_| | | ||  __/ |   \n |_|  |_|  \\___|\\__,_|\\___|_|  |_|\\___|_|\\_\\    \\__,_|\\___|  |_| \\_\\\\__,_|_|\\__\\___|_|   \n                                                                                          \n Welcome, Developer! Feel free to explore the console and source code.\n";

/**
 * Custom hook that prints a static ASCII art asset 
 * in the browser console when the client is idle.
 * This prevents main thread blockage, avoids bundle size increase, 
 * and completely eliminates hydration mismatches.
 */
export function useConsoleArt() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let idleCallbackId: number | null = null;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const logArt = () => {
      console.log(ASCII_ART);
    };

    if ("requestIdleCallback" in window) {
      idleCallbackId = window.requestIdleCallback(() => {
        logArt();
      });
    } else {
      // Fallback for environments where requestIdleCallback is not available
      timerId = setTimeout(logArt, 1);
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

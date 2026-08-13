"use client";

import { useState, useEffect, useCallback } from "react";

export interface ProjectTelemetry {
  views: number;
  clicks: number;
}

export type TelemetryData = Record<string, ProjectTelemetry>;

const CACHE_KEY = "portfolio_telemetry_cache";

// Simple global event hub for cross-component state synchronization in single-page runs
const listeners = new Set<() => void>();
let globalTelemetryData: TelemetryData = {};
let globalSyncFailed = false;
let isFirstLoad = true;

/**
 * Custom hook implementing a robust Stale-While-Revalidate (SWR) telemetry system.
 * Hydrates state instantly from LocalStorage cache to prevent Cumulative Layout Shifts (CLS),
 * schedules silent background syncs, and supports optimistic layout updates.
 */
export function useTelemetry() {
  const [telemetry, setTelemetry] = useState<TelemetryData>(globalTelemetryData);
  const [syncFailed, setSyncFailed] = useState<boolean>(globalSyncFailed);

  // Sync state changes across all active hook instances
  const triggerUpdate = useCallback(() => {
    setTelemetry({ ...globalTelemetryData });
    setSyncFailed(globalSyncFailed);
  }, []);

  useEffect(() => {
    listeners.add(triggerUpdate);
    return () => {
      listeners.delete(triggerUpdate);
    };
  }, [triggerUpdate]);

  // Initial local cache hydration
  useEffect(() => {
    if (typeof window === "undefined" || !isFirstLoad) return;
    isFirstLoad = false;

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        globalTelemetryData = JSON.parse(cached);
        listeners.forEach((listener) => listener());
      }
    } catch (e) {
      console.warn("Failed to retrieve local storage telemetry cache:", e);
    }
  }, []);

  // Fetch telemetry data from aggregate route handler in the background
  const fetchTelemetry = useCallback(async () => {
    try {
      const res = await fetch("/api/telemetry");
      if (!res.ok) throw new Error("Telemetry sync fetch failure");
      const data = (await res.json()) as TelemetryData;

      // Update global store and cache
      globalTelemetryData = { ...globalTelemetryData, ...data };
      globalSyncFailed = false;
      
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(globalTelemetryData));
      } catch (err) {
        console.warn("Failed to write to local storage telemetry cache:", err);
      }
      
      listeners.forEach((listener) => listener());
    } catch (err) {
      console.error("Background telemetry synchronization failed:", err);
      globalSyncFailed = true;
      listeners.forEach((listener) => listener());
    }
  }, []);

  // Trigger SWR sync on mount
  useEffect(() => {
    fetchTelemetry();
  }, [fetchTelemetry]);

  // Optimistic UI updates recorder
  const recordEvent = useCallback(
    async (projectSlug: string, eventType: "page_view" | "project_click" | "route_error" | "contact_click" | "simulator_milestone") => {
      // 1. Trigger optimistic local UI update immediately
      const currentStats = globalTelemetryData[projectSlug] || { views: 0, clicks: 0 };
      const updatedStats = {
        views: eventType === "page_view" ? currentStats.views + 1 : currentStats.views,
        clicks: eventType === "project_click" ? currentStats.clicks + 1 : currentStats.clicks,
      };

      globalTelemetryData = {
        ...globalTelemetryData,
        [projectSlug]: updatedStats,
      };

      // Write optimistically to local cache
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(globalTelemetryData));
      } catch (e) {
        console.warn("Failed to update optimistic telemetry cache:", e);
      }

      listeners.forEach((listener) => listener());

      // 2. Dispatch background network POST event
      try {
        const response = await fetch("/api/telemetry", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ projectSlug, eventType }),
        });

        if (!response.ok) {
          // If rate limited or server failed, revert or mark sync warnings
          if (response.status === 429) {
            console.warn("Telemetry record rate limited by API.");
          } else {
            throw new Error("Failed to persist telemetry event");
          }
        }
      } catch (err) {
        console.error("Optimistic telemetry sync persistence failed:", err);
        // Do not crash or block, just flag warning dot for user/developer HUD
        globalSyncFailed = true;
        listeners.forEach((listener) => listener());
      }
    },
    []
  );

  return {
    telemetry,
    syncFailed,
    recordEvent,
    refetch: fetchTelemetry,
  };
}

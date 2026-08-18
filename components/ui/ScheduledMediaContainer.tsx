"use client";

import React from "react";
import { useViewportMedia } from "@/hooks/useViewportMedia";
import { MEDIA_PRIORITY, type MediaPriority } from "@/lib/media-scheduler";

export interface ScheduledMediaContainerProps {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  isAboveTheFold?: boolean;
  priority?: MediaPriority;
  minHeight?: string; // e.g. '400px', '28rem'
  aspectRatio?: string;
  className?: string;
  placeholderTitle?: string;
  placeholderSubtitle?: string;
  loadFn?: () => Promise<unknown>;
}

/**
 * Viewport-Aware Scheduled Container for 3D Models and Heavy Media Suites.
 * Defers heavy DOM & WebGL mounting until thread capacity and viewport proximity allow.
 */
export const ScheduledMediaContainer: React.FC<ScheduledMediaContainerProps> = ({
  children,
  placeholder,
  isAboveTheFold = false,
  priority = isAboveTheFold ? MEDIA_PRIORITY.CRITICAL_ABOVE_THE_FOLD : MEDIA_PRIORITY.LOW,
  minHeight = "350px",
  aspectRatio,
  className = "",
  placeholderTitle = "Heavy Media Asset Queued",
  placeholderSubtitle = "Awaiting viewport proximity & main-thread idle window...",
  loadFn,
}) => {
  const { containerRef, isLoaded, status, connectionInfo } = useViewportMedia<unknown>(
    undefined,
    {
      isAboveTheFold,
      priority,
      loadFn: loadFn || (() => Promise.resolve(true)),
    }
  );

  return (
    <div
      ref={containerRef}
      style={{ minHeight, aspectRatio }}
      className={`relative w-full rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden ${className}`}
    >
      {!isLoaded ? (
        placeholder || (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-zinc-950/90 text-zinc-400">
            <div className="flex flex-col items-center gap-3 max-w-sm">
              <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-brand-cyan animate-pulse">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-200">{placeholderTitle}</h4>
                <p className="text-xs text-zinc-400 font-mono mt-1">{placeholderSubtitle}</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 mt-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800">
                <span
                  className={`w-2 h-2 rounded-full ${
                    status === "DEFERRED"
                      ? "bg-amber-400"
                      : status === "LOADING"
                      ? "bg-cyan-400 animate-ping"
                      : "bg-emerald-400"
                  }`}
                />
                <span className="uppercase">
                  Status: {status} {connectionInfo.isConstrained ? "(Constrained Net)" : ""}
                </span>
              </div>
            </div>
          </div>
        )
      ) : (
        children
      )}
    </div>
  );
};

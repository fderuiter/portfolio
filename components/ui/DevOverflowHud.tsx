"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { getEnv } from "@/lib/env";

export interface OverflowElementInfo {
  id: string;
  tagName: string;
  className: string;
  scrollWidth: number;
  clientWidth: number;
  overflowAmount: number;
  rect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  element: HTMLElement;
}

export interface DevOverflowHudProps {
  /**
   * Forces the HUD to enable regardless of NODE_ENV (useful for testing or debugging).
   */
  forceEnable?: boolean;
  /**
   * Scan debounce delay in milliseconds. Defaults to 200ms.
   */
  scanDebounceMs?: number;
  /**
   * Tolerance in pixels before flagging an element as overflowing. Defaults to 1px.
   */
  epsilon?: number;
}

/**
 * Interactive Developer Visual Layout Overflow HUD
 *
 * Exclusively active in development mode (or when forced via prop / test harness).
 * Monitors DOM elements using ResizeObserver and requestIdleCallback for horizontal layout
 * clipping where scrollWidth > clientWidth + epsilon. High-visibility overlay outlines pinpoint
 * offending elements in real time.
 */
export function DevOverflowHud({
  forceEnable = false,
  scanDebounceMs = 200,
  epsilon = 1,
}: DevOverflowHudProps) {
  const nodeEnv = getEnv().NODE_ENV;
  const isDev = nodeEnv === "development" || nodeEnv === "test" || forceEnable;
  const isProduction = nodeEnv === "production" && !forceEnable;

  const [enabled, setEnabled] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const [overflowElements, setOverflowElements] = useState<OverflowElementInfo[]>([]);
  const [inspectIndex, setInspectIndex] = useState<number | null>(null);

  const idleCallbackIdRef = useRef<number | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const scanDOM = useCallback(() => {
    if (typeof document === "undefined") return;

    const detected: OverflowElementInfo[] = [];
    const allElements = document.body.querySelectorAll<HTMLElement>("*");

    allElements.forEach((el, idx) => {
      // Ignore HUD overlay elements themselves or script/style tags
      if (
        el.closest('[data-dev-hud="true"]') ||
        el.tagName === "SCRIPT" ||
        el.tagName === "STYLE" ||
        el.tagName === "SVG" ||
        el.tagName === "PATH"
      ) {
        return;
      }

      // Read dimensions safely
      const scrollW = el.scrollWidth;
      const clientW = el.clientWidth;

      // Element overflows horizontally if scrollWidth > clientWidth + epsilon
      if (clientW > 0 && scrollW > clientW + epsilon) {
        const rect = el.getBoundingClientRect();
        // Ensure element is visible in the layout flow
        if (rect.width > 0 && rect.height > 0) {
          detected.push({
            id: el.id || `overflow-el-${idx}`,
            tagName: el.tagName.toLowerCase(),
            className: el.className ? String(el.className) : "",
            scrollWidth: scrollW,
            clientWidth: clientW,
            overflowAmount: scrollW - clientW,
            rect: {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
            },
            element: el,
          });
        }
      }
    });

    setOverflowElements(detected);
  }, [epsilon]);

  const scheduleScan = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        if (idleCallbackIdRef.current) {
          window.cancelIdleCallback(idleCallbackIdRef.current);
        }
        idleCallbackIdRef.current = window.requestIdleCallback(() => scanDOM(), {
          timeout: 1000,
        });
      } else {
        scanDOM();
      }
    }, scanDebounceMs);
  }, [scanDOM, scanDebounceMs]);

  useEffect(() => {
    if (isProduction || !isDev) return;

    // Initial DOM scan
    scheduleScan();

    // Set up ResizeObserver to listen for viewport / container resize events
    let resizeObserver: ResizeObserver | null = null;
    if (typeof window !== "undefined" && "ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(() => {
        scheduleScan();
      });
      resizeObserver.observe(document.body);
    }

    // Scroll & window resize listeners for positioning updates
    const handleScrollOrResize = () => {
      scheduleScan();
    };

    window.addEventListener("resize", handleScrollOrResize, { passive: true });
    window.addEventListener("scroll", handleScrollOrResize, { passive: true });

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (idleCallbackIdRef.current && typeof window !== "undefined" && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleCallbackIdRef.current);
      }
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("scroll", handleScrollOrResize);
    };
  }, [isDev, isProduction, scheduleScan]);

  const handleInspect = (direction: "next" | "prev") => {
    if (overflowElements.length === 0) return;
    let nextIdx = inspectIndex === null ? 0 : direction === "next" ? inspectIndex + 1 : inspectIndex - 1;
    if (nextIdx >= overflowElements.length) nextIdx = 0;
    if (nextIdx < 0) nextIdx = overflowElements.length - 1;

    setInspectIndex(nextIdx);
    const target = overflowElements[nextIdx];
    if (target && target.element) {
      target.element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Guard: if in production environment, return null completely
  if (isProduction || !isDev) {
    return null;
  }

  return (
    <div id="dev-overflow-hud-root" data-dev-hud="true">
      {/* Visual Overlay Highlighters */}
      {enabled && overflowElements.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
          {overflowElements.map((item, idx) => (
            <div
              key={item.id + idx}
              data-dev-hud="overlay"
              style={{
                position: "fixed",
                top: `${item.rect.top}px`,
                left: `${item.rect.left}px`,
                width: `${item.rect.width}px`,
                height: `${item.rect.height}px`,
              }}
              className={`border-2 rounded-sm transition-all duration-150 ${
                inspectIndex === idx
                  ? "border-yellow-400 bg-yellow-400/20 shadow-[0_0_12px_rgba(250,204,21,0.9)]"
                  : "border-rose-500 bg-rose-500/15 shadow-[0_0_8px_rgba(244,63,94,0.7)]"
              }`}
            >
              <div className="absolute -top-6 left-0 bg-rose-950 text-rose-200 text-[10px] font-mono px-1.5 py-0.5 rounded border border-rose-600/80 whitespace-nowrap shadow-md">
                &lt;{item.tagName}&gt; +{Math.round(item.overflowAmount)}px overflow ({item.scrollWidth}px vs {Math.round(item.clientWidth)}px)
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Interactive Dev HUD Toolbar */}
      <div className="fixed bottom-4 right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-50 font-mono text-xs select-none">
        {minimized ? (
          <button
            type="button"
            onClick={() => setMinimized(false)}
            data-testid="hud-expand-btn"
            className={`flex items-center justify-center gap-2 px-3.5 py-2.5 min-h-[44px] min-w-[44px] rounded-full border shadow-xl backdrop-blur-md transition-all ${
              overflowElements.length > 0
                ? "bg-rose-950/90 text-rose-200 border-rose-500/80 hover:bg-rose-900"
                : "bg-zinc-900/90 text-zinc-300 border-zinc-700/80 hover:bg-zinc-800"
            }`}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-bold">DEV HUD</span>
            {overflowElements.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-extrabold text-[10px]">
                {overflowElements.length}
              </span>
            )}
          </button>
        ) : (
          <div className="w-80 bg-zinc-950/95 border border-zinc-800/90 rounded-2xl shadow-2xl backdrop-blur-md p-3 text-zinc-200 flex flex-col gap-2.5">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                <span className="font-bold text-zinc-100 tracking-wide">Layout Overflow HUD</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setMinimized(true)}
                  aria-label="Minimize Dev HUD"
                  data-testid="hud-minimize-btn"
                  className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors font-bold"
                >
                  —
                </button>
              </div>
            </div>

            {/* Status Summary */}
            <div className="flex items-center justify-between">
              <div className="text-[11px]">
                {overflowElements.length > 0 ? (
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    {overflowElements.length} Overflow Element{overflowElements.length > 1 ? "s" : ""}
                  </span>
                ) : (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span>✓</span> Zero Layout Overflow
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={scheduleScan}
                data-testid="hud-rescan-btn"
                className="text-[10px] px-3 py-2 min-h-[44px] flex items-center justify-center rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors font-semibold"
              >
                Scan Now
              </button>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-900">
              <button
                type="button"
                onClick={() => setEnabled(!enabled)}
                data-testid="hud-toggle-btn"
                className={`flex-1 min-h-[44px] py-2 px-3 rounded-lg font-bold text-[11px] border transition-all flex items-center justify-center ${
                  enabled
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/40 hover:bg-cyan-500/20"
                    : "bg-zinc-800/80 text-zinc-400 border-zinc-700/60 hover:bg-zinc-800"
                }`}
              >
                {enabled ? "Highlights ON" : "Highlights OFF"}
              </button>

              {overflowElements.length > 0 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleInspect("prev")}
                    aria-label="Previous overflowing element"
                    data-testid="hud-prev-btn"
                    className="px-3 py-2 min-h-[44px] min-w-[44px] flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-200 text-[11px] font-bold"
                  >
                    ←
                  </button>
                  <span className="text-[10px] text-zinc-400 px-1">
                    {inspectIndex !== null ? inspectIndex + 1 : 0}/{overflowElements.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleInspect("next")}
                    aria-label="Next overflowing element"
                    data-testid="hud-next-btn"
                    className="px-3 py-2 min-h-[44px] min-w-[44px] flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-200 text-[11px] font-bold"
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

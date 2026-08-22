"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  ArcadeEngine,
  ArcadeGameLoop,
  ArcadeViewport,
  type ViewportMode,
  type ViewportMetrics,
  ArcadeInputManager,
} from "@/lib/arcade";

interface UseArcadeEngineOptions {
  viewportMode?: ViewportMode;
  baseWidth: number;
  baseHeight: number;
  maxDpr?: number;
  fixedDt?: number;
  paused?: boolean;
}

interface UseArcadeEngineReturn<
  TEngine extends ArcadeEngine<unknown, TSnapshot>,
  TSnapshot,
> {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  engine: TEngine;
  snapshot: TSnapshot;
  loop: ArcadeGameLoop;
  input: ArcadeInputManager;
  viewport: ArcadeViewport;
  isContextLost: boolean;
}

export function useArcadeEngine<
  TEngine extends ArcadeEngine<unknown, TSnapshot>,
  TSnapshot,
>(
  engineFactory: () => TEngine,
  options: UseArcadeEngineOptions
): UseArcadeEngineReturn<TEngine, TSnapshot> {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isContextLost, setIsContextLost] = useState(false);

  // Maintain stable instances of engine, loop, viewport, and input via useState initializers
  const [engine] = useState<TEngine>(engineFactory);

  const [viewport] = useState<ArcadeViewport>(
    () =>
      new ArcadeViewport({
        mode: options.viewportMode ?? "safe-zone",
        baseWidth: options.baseWidth,
        baseHeight: options.baseHeight,
        maxDpr: options.maxDpr ?? 2.0,
      })
  );

  const metricsRef = useRef<ViewportMetrics>(
    viewport.calculateMetrics(options.baseWidth, options.baseHeight, 1.0)
  );

  const [input] = useState<ArcadeInputManager>(() => new ArcadeInputManager());

  const [loop] = useState<ArcadeGameLoop>(
    () => new ArcadeGameLoop(engine, () => null, { fixedDt: options.fixedDt })
  );

  // Subscribe to engine state mutations via useSyncExternalStore
  const snapshot = useSyncExternalStore(
    (callback) => engine.subscribe(callback),
    () => engine.getSnapshot(),
    () => engine.getSnapshot()
  );

  // Synchronize pause status
  useEffect(() => {
    if (options.paused) {
      loop.pause();
    } else {
      loop.resume();
    }
  }, [options.paused, loop]);

  // Manage Canvas Lifecycle, ResizeObserver, and Context Loss
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Connect context getter to canvas
    loop.setContextGetter(() => canvas.getContext("2d"));

    // Handle 2D Context Loss / Restored
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setIsContextLost(true);
      loop.stop();
    };

    const handleContextRestored = () => {
      setIsContextLost(false);
      loop.start();
    };

    canvas.addEventListener("contextlost", handleContextLost);
    canvas.addEventListener("contextrestored", handleContextRestored);

    // Attach input manager
    input.attach(
      canvas,
      () =>
        metricsRef.current ||
        viewport.calculateMetrics(options.baseWidth, options.baseHeight, 1.0)
    );

    // Resize handler
    const updateSize = () => {
      const parent = canvas.parentElement;
      const rect = parent
        ? parent.getBoundingClientRect()
        : canvas.getBoundingClientRect();
      const dpr =
        typeof window !== "undefined" ? window.devicePixelRatio || 1.0 : 1.0;

      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));

      const metrics = viewport.calculateMetrics(w, h, dpr);
      metricsRef.current = metrics;

      canvas.width = metrics.internalWidth;
      canvas.height = metrics.internalHeight;
      canvas.style.width = `${metrics.canvasWidth}px`;
      canvas.style.height = `${metrics.canvasHeight}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        viewport.applyTransform(ctx, metrics);
      }

      engine.resize(w, h, dpr);
    };

    updateSize();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && canvas.parentElement) {
      resizeObserver = new ResizeObserver(() => {
        updateSize();
      });
      resizeObserver.observe(canvas.parentElement);
    }

    window.addEventListener("resize", updateSize);

    // Start loop
    loop.start();

    return () => {
      loop.stop();
      input.detach();
      canvas.removeEventListener("contextlost", handleContextLost);
      canvas.removeEventListener("contextrestored", handleContextRestored);
      window.removeEventListener("resize", updateSize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      engine.destroy();
    };
  }, [engine, loop, viewport, input, options.baseWidth, options.baseHeight]);

  return {
    canvasRef,
    engine,
    snapshot,
    loop,
    input,
    viewport,
    isContextLost,
  };
}

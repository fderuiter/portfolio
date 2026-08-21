"use client";

import { useRef, useEffect, useCallback } from "react";
import { useAudio } from "@/components/providers/AudioProvider";
import { env } from "@/lib/env";

interface CachedBounds {
  left: number;
  width: number;
  centerX: number;
  viewportWidth: number;
}

const boundsCache = new WeakMap<HTMLElement, CachedBounds>();
const registeredElements = new Set<HTMLElement>();
let globalResizeObserver: ResizeObserver | null = null;
let pendingAnimationFrame: number | null = null;
let cachedViewportWidth = typeof window !== "undefined" ? window.innerWidth : 1024;

/**
 * Batched update of bounding coordinates for all registered navigation elements.
 * Runs strictly within requestAnimationFrame execution frames.
 */
export function updateAllSpatialAudioBounds(): void {
  if (typeof window === "undefined") return;
  cachedViewportWidth = window.innerWidth || document.documentElement.clientWidth || 1024;

  registeredElements.forEach((el) => {
    if (el && el.isConnected) {
      const rect = el.getBoundingClientRect();
      boundsCache.set(el, {
        left: rect.left,
        width: rect.width,
        centerX: rect.left + rect.width / 2,
        viewportWidth: cachedViewportWidth,
      });
    } else {
      registeredElements.delete(el);
    }
  });
}

function scheduleBoundsUpdate(): void {
  if (typeof window === "undefined") return;
  if (pendingAnimationFrame !== null) return;

  const run = () => {
    pendingAnimationFrame = null;
    updateAllSpatialAudioBounds();
  };

  const isTestEnv = "vi" in globalThis || env.NODE_ENV === "test";
  if (isTestEnv) {
    pendingAnimationFrame = 1;
    if (typeof queueMicrotask === "function") {
      queueMicrotask(run);
    } else {
      setTimeout(run, 0);
    }
  } else if (typeof window.requestAnimationFrame === "function") {
    pendingAnimationFrame = window.requestAnimationFrame(run);
  } else {
    run();
  }
}

function initGlobalObserver(): void {
  if (typeof window === "undefined" || typeof ResizeObserver === "undefined") return;
  if (!globalResizeObserver) {
    globalResizeObserver = new ResizeObserver(() => {
      scheduleBoundsUpdate();
    });
    if (document.documentElement) {
      globalResizeObserver.observe(document.documentElement);
    }
  }
}

/**
 * Standardized observer hook for caching navigation link bounds and computing
 * spatial audio panning coordinates without synchronous layout queries during hover events.
 */
export function useSpatialAudioBounds<T extends HTMLElement = HTMLElement>() {
  const { playHover } = useAudio();
  const containerRef = useRef<T | null>(null);

  const measureElement = useCallback((el: HTMLElement) => {
    if (!el || !el.isConnected) return;
    registeredElements.add(el);
    initGlobalObserver();
    if (globalResizeObserver) {
      try {
        globalResizeObserver.observe(el);
      } catch {
        // Fallback for non-standard elements
      }
    }
    const vpWidth = window.innerWidth || document.documentElement.clientWidth || 1024;
    const rect = el.getBoundingClientRect();
    boundsCache.set(el, {
      left: rect.left,
      width: rect.width,
      centerX: rect.left + rect.width / 2,
      viewportWidth: vpWidth,
    });
  }, []);

  const registerNavElement = useCallback(
    (node: HTMLElement | null) => {
      if (node) {
        measureElement(node);
      }
    },
    [measureElement]
  );

  const getPan = useCallback(
    (node: HTMLElement): number => {
      let cached = boundsCache.get(node);
      if (!cached) {
        measureElement(node);
        cached = boundsCache.get(node);
      }
      if (cached) {
        const vpWidth = cached.viewportWidth || window.innerWidth || 1024;
        return (cached.centerX / vpWidth) * 2 - 1;
      }
      return 0;
    },
    [measureElement]
  );

  const handleHover = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const el = e.currentTarget;
      if (!el) {
        playHover();
        return;
      }
      const pan = getPan(el);
      playHover(pan);
    },
    [getPan, playHover]
  );

  const setContainerRef = useCallback(
    (node: T | null) => {
      containerRef.current = node;
      if (node) {
        measureElement(node);
        const interactiveElements = node.querySelectorAll<HTMLElement>("a, button, [role='button']");
        interactiveElements.forEach((child) => measureElement(child));
      }
    },
    [measureElement]
  );

  useEffect(() => {
    const node = containerRef.current;
    if (node) {
      setContainerRef(node);
    }
    scheduleBoundsUpdate();
  }, [setContainerRef]);

  return {
    containerRef: setContainerRef,
    registerNavElement,
    getPan,
    handleHover,
  };
}

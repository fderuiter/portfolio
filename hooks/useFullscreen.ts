"use client";

import { useState, useEffect, useCallback, RefObject } from "react";

export interface UseFullscreenOptions {
  /**
   * Whether to enable the 'F' key shortcut to toggle fullscreen when focused or within element.
   * Default is true.
   */
  enableKeyShortcut?: boolean;
  /**
   * Callback invoked when fullscreen status changes.
   */
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

export interface UseFullscreenReturn {
  isFullscreen: boolean;
  isPseudoFullscreen: boolean;
  isSupported: boolean;
  enterFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
  toggleFullscreen: () => Promise<void>;
}

interface WebKitDocument extends Document {
  webkitFullscreenElement?: Element;
  webkitExitFullscreen?: () => Promise<void>;
}

interface WebKitHTMLElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>;
}

/**
 * React hook for managing Fullscreen mode with WebKit vendor fallback
 * and CSS pseudo-fullscreen fallback for iOS Safari.
 */
export function useFullscreen(
  targetRef: RefObject<HTMLElement | null>,
  options: UseFullscreenOptions = {}
): UseFullscreenReturn {
  const { enableKeyShortcut = true, onFullscreenChange } = options;

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isPseudoFullscreen, setIsPseudoFullscreen] = useState<boolean>(false);
  const [isSupported] = useState<boolean>(() => {
    if (typeof document === "undefined") return true;
    const doc = document as WebKitDocument;
    return doc.fullscreenEnabled !== undefined
      ? !!doc.fullscreenEnabled
      : !!(
          doc.documentElement?.requestFullscreen ||
          (doc.documentElement as WebKitHTMLElement)?.webkitRequestFullscreen ||
          true
        );
  });

  const handleFullscreenChange = useCallback(() => {
    if (typeof document === "undefined") return;
    const doc = document as WebKitDocument;
    const fsElement = doc.fullscreenElement || doc.webkitFullscreenElement;
    const active = !!fsElement && (!targetRef.current || fsElement === targetRef.current || targetRef.current.contains(fsElement));
    
    setIsFullscreen(active);
    if (active) {
      setIsPseudoFullscreen(false);
    }
    onFullscreenChange?.(active);
  }, [targetRef, onFullscreenChange]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, [handleFullscreenChange]);

  const enterFullscreen = useCallback(async () => {
    const el = targetRef.current;
    if (!el || typeof document === "undefined") return;

    const webkitEl = el as WebKitHTMLElement;

    try {
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if (webkitEl.webkitRequestFullscreen) {
        await webkitEl.webkitRequestFullscreen();
      } else {
        // Fallback to pseudo-fullscreen on iOS Safari
        setIsPseudoFullscreen(true);
        setIsFullscreen(true);
        onFullscreenChange?.(true);
      }
    } catch {
      // If native request is blocked or rejected, activate pseudo-fullscreen
      setIsPseudoFullscreen(true);
      setIsFullscreen(true);
      onFullscreenChange?.(true);
    }
  }, [targetRef, onFullscreenChange]);

  const exitFullscreen = useCallback(async () => {
    if (typeof document === "undefined") return;
    const doc = document as WebKitDocument;

    if (isPseudoFullscreen) {
      setIsPseudoFullscreen(false);
      setIsFullscreen(false);
      onFullscreenChange?.(false);
      return;
    }

    try {
      if (doc.exitFullscreen && (doc.fullscreenElement || doc.webkitFullscreenElement)) {
        await doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen && (doc.fullscreenElement || doc.webkitFullscreenElement)) {
        await doc.webkitExitFullscreen();
      } else {
        setIsPseudoFullscreen(false);
        setIsFullscreen(false);
        onFullscreenChange?.(false);
      }
    } catch {
      setIsPseudoFullscreen(false);
      setIsFullscreen(false);
      onFullscreenChange?.(false);
    }
  }, [isPseudoFullscreen, onFullscreenChange]);

  const toggleFullscreen = useCallback(async () => {
    if (isFullscreen || isPseudoFullscreen) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
  }, [isFullscreen, isPseudoFullscreen, enterFullscreen, exitFullscreen]);

  // Keyboard shortcut listener
  useEffect(() => {
    if (!enableKeyShortcut || typeof window === "undefined") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input, textarea, contentEditable, or inside an external keyboard boundary
      const target = e.target as HTMLElement;
      const el = targetRef.current;
      const isWithin = !!(el && target && target instanceof Node && el.contains(target));
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          (target.closest?.("[data-keyboard-boundary]") && !isWithin))
      ) {
        return;
      }

      if (e.key === "f" || e.key === "F") {
        // Check if event occurred within target or target is active/focused
        const el = targetRef.current;
        const isWithin = !!(el && target && target instanceof Node && el.contains(target));
        const isWindowOrDoc = (target as EventTarget | null) === window || (target as EventTarget | null) === document || target === document.body;
        if (el && (isWithin || document.activeElement === el || isFullscreen || isWindowOrDoc || !target)) {
          e.preventDefault();
          void toggleFullscreen();
        }
      } else if (e.key === "Escape" && isPseudoFullscreen) {
        e.preventDefault();
        void exitFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enableKeyShortcut, targetRef, isFullscreen, isPseudoFullscreen, toggleFullscreen, exitFullscreen]);

  return {
    isFullscreen: isFullscreen || isPseudoFullscreen,
    isPseudoFullscreen,
    isSupported,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  };
}

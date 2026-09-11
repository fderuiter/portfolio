"use client";

import { useEffect, useRef, useCallback } from "react";
import { env } from "@/lib/env";

export interface UseFocusTrapOptions {
  /**
   * Element or ref to focus immediately when the trap activates.
   */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  /**
   * Callback triggered when Escape key is pressed.
   */
  onEscape?: () => void;
  /**
   * Whether to restore focus to previously active element upon unmount or deactivation.
   * Defaults to true.
   */
  returnFocus?: boolean;
  /**
   * Custom keydown handler to process shortcuts (e.g., Arrow keys, letter hotkeys)
   * while the trap is active before or along with standard trap behavior.
   */
  onKeyDown?: (event: KeyboardEvent) => void;
}

// Module-level count of currently-active focus traps across the whole page
// (a dialog, drawer, or overlay is "active" while its trap is mounted and
// trapping focus). Consulted by other window-level keydown listeners (e.g.
// useFullscreen's Escape-to-exit-pseudo-fullscreen shortcut) that would
// otherwise fire alongside a dialog's own Escape handler on the same
// keypress: native addEventListener does not let stopPropagation cancel
// sibling listeners already registered on the same target, so a shared
// "is any dialog currently open" signal is the only reliable way to give
// the topmost dialog exclusive ownership of Escape.
let activeFocusTrapCount = 0;

/** True while at least one useFocusTrap instance is currently active. */
export function isAnyFocusTrapActive(): boolean {
  return activeFocusTrapCount > 0;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
  "audio[controls]",
  "video[controls]",
  '[contenteditable]:not([contenteditable="false"])',
].join(", ");

/**
 * Custom hook to trap keyboard focus within a container element for modal dialogs and drawers.
 *
 * Implements WCAG 2.1 Focus Order and Keyboard Navigation compliance.
 *
 * @param active - Whether focus trapping is currently active.
 * @param options - Configuration options for initial focus, escape handler, and focus restoration.
 * @returns A RefObject to attach to the container element.
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  active: boolean,
  options: UseFocusTrapOptions = {}
): React.RefObject<T | null> {
  const containerRef = useRef<T | null>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const { initialFocusRef, onEscape, returnFocus = true, onKeyDown } = options;

  const onEscapeRef = useRef(onEscape);
  const onKeyDownRef = useRef(onKeyDown);

  useEffect(() => {
    onEscapeRef.current = onEscape;
    onKeyDownRef.current = onKeyDown;
  }, [onEscape, onKeyDown]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!active || !containerRef.current) return;

      if (event.key === "Escape" && onEscapeRef.current) {
        event.preventDefault();
        // stopPropagation alone only stops the event reaching other DOM
        // nodes; sibling listeners already registered on this same target
        // (window) still fire. stopImmediatePropagation additionally
        // suppresses those, giving this dialog exclusive ownership of the
        // keypress instead of also triggering e.g. a fullscreen-exit
        // shortcut listening on the same target.
        event.stopImmediatePropagation();
        event.stopPropagation();
        onEscapeRef.current();
        return;
      }

      if (onKeyDownRef.current) {
        onKeyDownRef.current(event);
        if (event.defaultPrevented) {
          event.stopPropagation();
          return;
        }
      }

      if (event.key !== "Tab") return;

      const container = containerRef.current;
      const focusableElements = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter(
        (el) =>
          !el.hasAttribute("disabled") &&
          el.getAttribute("aria-hidden") !== "true" &&
          (el.offsetParent !== null ||
            typeof env.VITEST !== "undefined" ||
            el.style.display !== "none")
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const currentActive = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        // Shift + Tab: if on first element or outside, move to last
        if (
          currentActive === firstElement ||
          !container.contains(currentActive)
        ) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: if on last element or outside, move to first
        if (
          currentActive === lastElement ||
          !container.contains(currentActive)
        ) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    },
    [active]
  );

  useEffect(() => {
    if (!active) return;

    activeFocusTrapCount++;

    if (typeof document !== "undefined") {
      previousActiveElementRef.current =
        document.activeElement as HTMLElement | null;
    }

    const timer = setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else if (containerRef.current) {
        const firstFocusable =
          containerRef.current.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        if (firstFocusable) {
          firstFocusable.focus();
        } else {
          containerRef.current.focus();
        }
      }
    }, 50);

    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      activeFocusTrapCount = Math.max(0, activeFocusTrapCount - 1);
      clearTimeout(timer);
      if (typeof window !== "undefined") {
        window.removeEventListener("keydown", handleKeyDown);
      }
      if (returnFocus && previousActiveElementRef.current) {
        const target = previousActiveElementRef.current;
        setTimeout(() => {
          if (target && typeof target.focus === "function") {
            target.focus();
          }
        }, 0);
      }
    };
  }, [active, handleKeyDown, initialFocusRef, returnFocus]);

  return containerRef;
}

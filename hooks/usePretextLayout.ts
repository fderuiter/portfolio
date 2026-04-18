"use client";

import { useState, useLayoutEffect, useRef, useCallback } from "react";
import { prepare, layout, clearCache, type PreparedText } from "@chenglou/pretext";
import { prepareRichInline } from "@chenglou/pretext/rich-inline";

interface UsePretextLayoutOptions {
  text: string;
  fontSize?: number;
  lineHeight: number;
  fontFamilyVariable?: string;
}

interface PretextLayoutState {
  isReady: boolean;
  height: number;
  lineCount: number;
}

export function usePretextLayout({
  text,
  fontSize = 16,
  lineHeight,
  fontFamilyVariable = "--font-inter",
}: UsePretextLayoutOptions) {
  const [state, setState] = useState<PretextLayoutState>({
    isReady: false,
    height: 0,
    lineCount: 0,
  });

  const containerRef = useRef<HTMLElement | null>(null);
  const preparedTextRef = useRef<PreparedText | null>(null);

  const measureText = useCallback((maxWidth: number) => {
    if (!preparedTextRef.current) return;

    const result = layout(preparedTextRef.current, maxWidth, lineHeight);

    setState((prev) => {
      if (prev.height === result.height && prev.lineCount === result.lineCount) {
        return prev;
      }
      return {
        isReady: true,
        height: result.height,
        lineCount: result.lineCount,
      };
    });
  }, [lineHeight]);

  useLayoutEffect(() => {
    // Determine the exact font family string from CSS variables
    const computedFontFamily = window.getComputedStyle(document.documentElement).getPropertyValue(fontFamilyVariable).trim() || 'Arial, sans-serif';
    const fontString = `${fontSize}px ${computedFontFamily}`;

    // Preparation Phase: Cache text measurement
    preparedTextRef.current = prepare(text, fontString);

    if (containerRef.current) {
      // If we have a container right away, do an initial measurement based on its current width
      const initialWidth = containerRef.current.getBoundingClientRect().width;
      measureText(initialWidth);
    } else {
       // If no container is attached yet, just mark as ready
       setState((prev) => ({ ...prev, isReady: true }));
    }
  }, [text, fontSize, fontFamilyVariable, measureText]);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    // Execution Phase: ResizeObserver for fast layout path
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const maxWidth = entry.contentRect.width;
        measureText(maxWidth);
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [measureText]);

  return {
    ref: containerRef,
    ...state,
  };
}

// Export global lifecycle helpers and rich-inline utilities
export { clearCache, prepareRichInline };

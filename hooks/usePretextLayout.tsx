"use client";

import React, { useState, useLayoutEffect, useRef, useCallback } from "react";
import { prepare, layout, clearCache, type PreparedText } from "@chenglou/pretext";
import { type RichInlineLine, prepareRichInline } from "@chenglou/pretext/rich-inline";
import { designManifest } from "@/lib/design-manifest";
import { type EngineToken } from "@/lib/engine";

// --- Global Caches ---
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  constructor(private capacity: number) {}
  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    const val = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }
  set(key: K, value: V) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }
}

const textPrepareCache = new LRUCache<string, PreparedText>(500);
const textLayoutCache = new LRUCache<string, { height: number; lineCount: number }>(2000);

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

  const containerRef = useRef<HTMLDivElement | null>(null);
  const preparedTextRef = useRef<PreparedText | null>(null);
  const fontStringRef = useRef<string>("");

  const measureText = useCallback((maxWidth: number) => {
    if (!preparedTextRef.current || !fontStringRef.current) return;

    const cacheKey = `${text}|${fontStringRef.current}|${maxWidth}|${lineHeight}`;
    let result = textLayoutCache.get(cacheKey);

    if (!result) {
      result = layout(preparedTextRef.current, maxWidth, lineHeight);
      textLayoutCache.set(cacheKey, result);
    }

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
  }, [text, lineHeight]);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Senior Design: Extract active Tailwind v4 resolved font variable
    const rootStyle = window.getComputedStyle(document.documentElement);
    const rawFontFamily = rootStyle.getPropertyValue(fontFamilyVariable).trim();

    // 2. Safe Fallback Matrix: Fallback gracefully to prevent Canvas errors
    const resolvedFontFamily = rawFontFamily || designManifest.typography.fonts.sans;
    const fontString = `${fontSize}px ${resolvedFontFamily}`;
    fontStringRef.current = fontString;

    // 3. Phase 1 Preparation: Parse text and cache measurements in Canvas
    const prepareKey = `${text}|${fontString}`;
    let prepared = textPrepareCache.get(prepareKey);
    if (!prepared) {
      prepared = prepare(text, fontString);
      textPrepareCache.set(prepareKey, prepared);
    }
    preparedTextRef.current = prepared;

    if (containerRef.current) {
      const initialWidth = containerRef.current.getBoundingClientRect().width;
      measureText(initialWidth);
    } else {
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

interface PretextTextProps {
  text: string;
  fontSize?: number;
  lineHeight: number;
  fontFamilyVariable?: string;
  semanticTag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div" | "article" | "section";
  className?: string;
  children?: React.ReactNode;
}

export const PretextText: React.FC<PretextTextProps> = ({
  text,
  fontSize = 16,
  lineHeight,
  fontFamilyVariable = "--font-inter",
  semanticTag = "p",
  className,
  children,
}) => {
  const { ref, height, isReady } = usePretextLayout({
    text,
    fontSize,
    lineHeight,
    fontFamilyVariable,
  });

  const SemanticElement = semanticTag;

  return (
    <>
      {/* 1. Visually Hidden Semantic DOM Parallel Node */}
      <SemanticElement className="sr-only">
        {text}
      </SemanticElement>

      {/* 2. Isolated Visual Layout Container hidden from Assistive Tech */}
      <div
        ref={ref}
        aria-hidden="true"
        role="presentation"
        style={{
          height: isReady ? `${height}px` : "auto",
        }}
        className={className}
      >
        {children || text}
      </div>
    </>
  );
};

// ==========================================
// PRETEXT RICH INLINE TEXT ENGINE (ISSUE #45)
// ==========================================

interface PretextRichTextProps {
  lines: RichInlineLine[];
  items: EngineToken[];
  lineHeight: number;
  className?: string;
  isReady?: boolean;
  fallbackText?: string;
}

export const PretextRichText: React.FC<PretextRichTextProps> = ({
  lines,
  items,
  lineHeight,
  className,
  isReady = true,
  fallbackText = "",
}) => {
  if (!isReady || lines.length === 0) {
    return (
      <p className={className}>
        {fallbackText}
      </p>
    );
  }

  const cleanFallbackText = fallbackText
    ? fallbackText.replace(/\*\*|`|\*/g, "")
    : items.map((it) => it.text).join("");

  return (
    <>
      <p className="sr-only">{cleanFallbackText}</p>
      <div 
        aria-hidden="true" 
        role="presentation" 
        className={className}
        style={{ display: "flex", flexDirection: "column" }}
      >
        {lines.map((line, lineIdx) => (
          <div 
            key={lineIdx} 
            className="flex flex-wrap items-center overflow-hidden"
            style={{ height: `${lineHeight}px`, lineHeight: `${lineHeight}px` }}
          >
            {line.fragments.map((frag, fragIdx) => {
              const item = items[frag.itemIndex];
              
              if (item?.type === "code") {
                return (
                  <span
                    key={fragIdx}
                    className="px-1.5 py-0 mx-0.5 text-[11px] font-mono font-bold bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan rounded-md inline-block shadow-[0_0_10px_rgba(6,182,212,0.05)] align-middle leading-[1.3] truncate select-text"
                    style={{ 
                      marginLeft: frag.gapBefore > 0 ? `${frag.gapBefore}px` : undefined,
                    }}
                  >
                    {frag.text}
                  </span>
                );
              }

              const style = item?.type === "bold"
                ? "font-bold text-neutral-100"
                : item?.type === "italic"
                ? "italic text-zinc-300"
                : "text-zinc-400";

              return (
                <span
                  key={fragIdx}
                  className={style}
                  style={{ 
                    marginLeft: frag.gapBefore > 0 ? `${frag.gapBefore}px` : undefined,
                  }}
                >
                  {frag.text}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
};

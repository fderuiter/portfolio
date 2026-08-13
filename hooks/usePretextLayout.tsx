"use client";

import React, { useState, useLayoutEffect, useRef, useCallback } from "react";
import { useResizeObserver } from "./useResizeObserver";
import { prepare, layout, clearCache, type PreparedText } from "@chenglou/pretext";
import { 
  prepareRichInline, 
  walkRichInlineLineRanges, 
  materializeRichInlineLineRange,
  type PreparedRichInline,
  type RichInlineLine,
  type RichInlineItem,
  type RichInlineLineRange
} from "@chenglou/pretext/rich-inline";
import { designManifest } from "@/lib/design-manifest";
import { resolveThemeFonts, resolveSingleThemeFont } from "@/lib/layout-config";

import { 
  isBrowser, 
  validateLayoutHeight,
  textPrepareCache,
  textLayoutCache,
  richItemsCache,
  richPrepareCache,
  richLayoutCache
} from "@/lib/graphics-engine";

interface UsePretextLayoutOptions {
  text: string;
  fontSize?: number;
  lineHeight: number;
  fontFamilyVariable?: string;
  translationMode?: string;
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
  translationMode,
}: UsePretextLayoutOptions) {
  const [state, setState] = useState<PretextLayoutState>({
    isReady: false,
    height: 0,
    lineCount: 0,
  });

  const preparedTextRef = useRef<PreparedText | null>(null);
  const fontStringRef = useRef<string>("");

  const measureText = useCallback((maxWidth: number) => {
    if (!preparedTextRef.current || !fontStringRef.current) return;

    const flooredWidth = Math.floor(maxWidth);
    const cacheKey = `${text}|${fontStringRef.current}|${flooredWidth}|${lineHeight}`;
    let result = textLayoutCache.get(cacheKey);

    if (!result) {
      result = layout(preparedTextRef.current, flooredWidth, lineHeight);
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

  const containerRef = useResizeObserver<HTMLDivElement>((entry) => {
    const maxWidth = entry.contentRect.width;
    measureText(maxWidth);
  });

  useLayoutEffect(() => {
    if (translationMode !== undefined) {
      textPrepareCache.clear();
      textLayoutCache.clear();
      richItemsCache.clear();
      richPrepareCache.clear();
      richLayoutCache.clear();
      clearCache();
    }
  }, [translationMode]);

  useLayoutEffect(() => {
    if (!isBrowser()) return;

    // 1. Senior Design: Extract active Tailwind v4 resolved font variable & use central resolver
    const fontString = resolveSingleThemeFont(fontSize, fontFamilyVariable);
    fontStringRef.current = fontString;

    // 2. Phase 1 Preparation: Parse text and cache measurements in Canvas
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
  }, [text, fontSize, fontFamilyVariable, measureText, containerRef, translationMode]);

  // Removed custom ResizeObserver in favor of unified useResizeObserver hook

  // Layout Height Validation Trigger
  useLayoutEffect(() => {
    if (state.isReady && containerRef.current) {
      const actualHeight = containerRef.current.getBoundingClientRect().height;
      validateLayoutHeight(
        state.height,
        actualHeight,
        `usePretextLayout (text: "${text.slice(0, 30)}...")`
      );
    }
  }, [state.isReady, state.height, text]);

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

export interface ExtendedRichInlineItem extends RichInlineItem {
  type: "text" | "bold" | "italic" | "code";
}

/**
 * Tokenizes markdown-like inline text (**bold**, *italic*, `code`) into RichInlineItem arrays.
 */
export function parseMarkdownToRichItems(
  text: string,
  baseFont: string,
  boldFont: string,
  italicFont: string,
  codeFont: string
): ExtendedRichInlineItem[] {
  const items: ExtendedRichInlineItem[] = [];
  const regex = /(\*\*.*?\*\*|`.*?`|\*.*?\*|[^*`\n]+|\n)/g;
  
  let match;
  while ((match = regex.exec(text)) !== null) {
    const raw = match[0];
    if (raw === "\n") {
      items.push({
        text: " ",
        font: baseFont,
        type: "text",
      });
    } else if (raw.startsWith("**") && raw.endsWith("**") && raw.length > 4) {
      items.push({
        text: raw.slice(2, -2),
        font: boldFont,
        type: "bold",
      });
    } else if (raw.startsWith("`") && raw.endsWith("`") && raw.length > 2) {
      items.push({
        text: raw.slice(1, -1),
        font: codeFont,
        type: "code",
        break: "never",
        extraWidth: 12, // padding + borders on our styled code chips
      });
    } else if (raw.startsWith("*") && raw.endsWith("*") && raw.length > 2) {
      items.push({
        text: raw.slice(1, -1),
        font: italicFont,
        type: "italic",
      });
    } else {
      items.push({
        text: raw,
        font: baseFont,
        type: "text",
      });
    }
  }
  
  return items;
}

interface UsePretextRichLayoutOptions {
  text: string;
  fontSize?: number;
  lineHeight: number;
  fontFamilyVariable?: string;
  translationMode?: string;
}

export function usePretextRichLayout({
  text,
  fontSize = designManifest.typography.sizes.sm.fontSize,
  lineHeight,
  fontFamilyVariable = "--font-inter",
  translationMode,
}: UsePretextRichLayoutOptions) {
  const [state, setState] = useState<{
    isReady: boolean;
    height: number;
    lines: RichInlineLine[];
    items: ExtendedRichInlineItem[];
  }>({
    isReady: false,
    height: 0,
    lines: [],
    items: [],
  });

  const preparedRef = useRef<PreparedRichInline | null>(null);
  const itemsRef = useRef<ExtendedRichInlineItem[]>([]);
  const itemsKeyRef = useRef<string>("");

  const measureRichText = useCallback((maxWidth: number) => {
    if (!preparedRef.current || !itemsKeyRef.current) return;

    const flooredWidth = Math.floor(maxWidth);
    const layoutKey = `${itemsKeyRef.current}|${flooredWidth}|${lineHeight}`;
    let cachedResult = richLayoutCache.get(layoutKey);

    if (!cachedResult) {
      const prepared = preparedRef.current;
      const linesRanges: RichInlineLineRange[] = [];
      walkRichInlineLineRanges(prepared, flooredWidth, (range) => {
        linesRanges.push(range);
      });

      const materializedLines = linesRanges.map((range) =>
        materializeRichInlineLineRange(prepared, range)
      );

      cachedResult = {
        height: materializedLines.length * lineHeight,
        lines: materializedLines,
      };
      richLayoutCache.set(layoutKey, cachedResult);
    }

    const { height: calculatedHeight, lines: materializedLines } = cachedResult;

    setState((prev) => {
      if (prev.height === calculatedHeight && prev.lines.length === materializedLines.length) {
        return prev;
      }
      return {
        isReady: true,
        height: calculatedHeight,
        lines: materializedLines,
        items: itemsRef.current,
      };
    });
  }, [lineHeight]);

  const containerRef = useResizeObserver<HTMLDivElement>((entry) => {
    const maxWidth = entry.contentRect.width;
    measureRichText(maxWidth);
  });

  useLayoutEffect(() => {
    if (translationMode !== undefined) {
      textPrepareCache.clear();
      textLayoutCache.clear();
      richItemsCache.clear();
      richPrepareCache.clear();
      richLayoutCache.clear();
      clearCache();
    }
  }, [translationMode]);

  useLayoutEffect(() => {
    if (!isBrowser()) return;

    const { baseFont, boldFont, italicFont, codeFont } = resolveThemeFonts(fontSize, fontFamilyVariable);

    const fontsKey = `${baseFont}|${boldFont}|${italicFont}|${codeFont}`;
    const itemsKey = `${text}|${fontsKey}`;
    itemsKeyRef.current = itemsKey;

    let parsedItems = richItemsCache.get(itemsKey) as ExtendedRichInlineItem[] | undefined;
    if (!parsedItems) {
      parsedItems = parseMarkdownToRichItems(text, baseFont, boldFont, italicFont, codeFont);
      richItemsCache.set(itemsKey, parsedItems);
    }
    itemsRef.current = parsedItems;

    let prepared = richPrepareCache.get(itemsKey);
    if (!parsedItems || !prepared) {
      prepared = prepareRichInline(parsedItems || []);
      richPrepareCache.set(itemsKey, prepared);
    }
    preparedRef.current = prepared;

    if (containerRef.current) {
      const initialWidth = containerRef.current.getBoundingClientRect().width;
      measureRichText(initialWidth);
    } else {
      setState((prev) => ({ ...prev, isReady: true }));
    }
  }, [text, fontSize, fontFamilyVariable, measureRichText, containerRef, translationMode]);

  // Removed custom ResizeObserver in favor of unified useResizeObserver hook

  // Layout Height Validation Trigger
  useLayoutEffect(() => {
    if (state.isReady && containerRef.current) {
      const actualHeight = containerRef.current.getBoundingClientRect().height;
      validateLayoutHeight(
        state.height,
        actualHeight,
        `usePretextRichLayout (text: "${text.slice(0, 30)}...")`
      );
    }
  }, [state.isReady, state.height, text]);

  return {
    ref: containerRef,
    ...state,
  };
}

interface PretextRichTextProps {
  lines: RichInlineLine[];
  items: ExtendedRichInlineItem[];
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


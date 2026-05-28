/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { 
  type RichInlineLine,
  type RichInlineItem,
} from "@chenglou/pretext/rich-inline";
import { designManifest } from "@/lib/design-manifest";

interface UsePretextLayoutOptions {
  text: string;
  fontSize?: number;
  lineHeight: number;
  fontFamilyVariable?: string;
}

interface PretextLayoutState {
  isReady: boolean;
  height?: number;
  lineCount?: number;
  ref?: React.RefObject<HTMLDivElement | null>;
}

export function usePretextLayout(_options: UsePretextLayoutOptions): PretextLayoutState {
  // READY BY DEFAULT: Deterministic server layout engine removes manual hydration hacks.
  // By delegating text-wrapping to the native CSS engine, we eliminate CLS.
  return {
    isReady: true,
    height: undefined, // Let native CSS handle wrapping naturally
    lineCount: undefined,
  };
}

// Export global lifecycle helpers and rich-inline utilities
export const clearCache = () => {};
export const prepareRichInline = (items: unknown) => items;

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
  semanticTag = "p",
  className,
  children,
}) => {
  const SemanticElement = semanticTag;

  return (
    <>
      {/* 1. Visually Hidden Semantic DOM Parallel Node */}
      <SemanticElement className="sr-only">
        {text}
      </SemanticElement>

      {/* 2. Isolated Visual Layout Container hidden from Assistive Tech */}
      <div
        aria-hidden="true"
        role="presentation"
        style={{ height: "auto" }}
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
        extraWidth: 12,
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
}

export function usePretextRichLayout({
  text,
  fontSize = designManifest.typography.sizes.sm.fontSize,
  fontFamilyVariable = "--font-inter",
}: UsePretextRichLayoutOptions) {
  // Deterministic server layout engine parses items but skips canvas measurement.
  const baseFont = `400 ${fontSize}px var(${fontFamilyVariable})`;
  const boldFont = `700 ${fontSize}px var(${fontFamilyVariable})`;
  const italicFont = `italic 400 ${fontSize}px var(${fontFamilyVariable})`;
  const codeFont = `500 ${fontSize - 1}px monospace`;

  const parsedItems = parseMarkdownToRichItems(text, baseFont, boldFont, italicFont, codeFont);

  return {
    ref: undefined,
    isReady: true,
    height: undefined,
    lines: [], // CSS fallback rendering handles the inline wrapping naturally
    items: parsedItems,
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
  items,
  lineHeight,
  className,
  fallbackText = "",
}) => {
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
        style={{ lineHeight: `${lineHeight}px` }}
      >
        {items.map((item, idx) => {
          if (item?.type === "code") {
            return (
              <span
                key={idx}
                className="px-1.5 py-0 mx-0.5 text-[11px] font-mono font-bold bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan rounded-md inline-block shadow-[0_0_10px_rgba(6,182,212,0.05)] align-middle leading-[1.3] truncate select-text"
              >
                {item.text}
              </span>
            );
          }

          const style = item?.type === "bold"
            ? "font-bold text-neutral-100"
            : item?.type === "italic"
            ? "italic text-zinc-300"
            : "text-zinc-400 inline";

          return (
            <span
              key={idx}
              className={style}
            >
              {item.text}
            </span>
          );
        })}
      </div>
    </>
  );
};


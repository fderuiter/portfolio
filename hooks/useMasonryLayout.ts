import { useState, useLayoutEffect, useRef, useCallback } from "react";
import { designManifest } from "@/lib/design-manifest";
import { parseMarkdownToRichItems, type ExtendedRichInlineItem } from "@/hooks/usePretextLayout";
import { prepareRichInline, type RichInlineLine } from "@chenglou/pretext/rich-inline";
import { LAYOUT_CONFIG } from "@/lib/layout-config";
import { GitHubStats } from "@/lib/github";
import { calculateMasonryLayout, type PreparedData } from "@/lib/masonry";
import { CaseStudyBadge } from "@/types/domain";

export interface MasonryItem {
  id: string;
  editorial_content: string;
  githubStats?: GitHubStats | null;
  badges?: CaseStudyBadge[] | null;
}

export interface LayoutItem<T extends MasonryItem> {
  item: T;
  height: number;
  lines: RichInlineLine[];
  items: ExtendedRichInlineItem[];
}

export function useMasonryLayout<T extends MasonryItem>(
  allItems: T[],
  filteredItems: T[]
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const containerWidthRef = useRef<number>(0);
  const preparedDataRef = useRef<Record<string, PreparedData>>({});

  const [layoutState, setLayoutState] = useState<{
    colCount: number;
    columns: (T & { height: number; lines: RichInlineLine[]; items: ExtendedRichInlineItem[] })[][];
    isReady: boolean;
  }>({
    colCount: LAYOUT_CONFIG.COLS.SM,
    columns: [
      allItems.map((s) => ({
        ...s,
        height: LAYOUT_CONFIG.FALLBACK_ITEM_HEIGHT,
        lines: [],
        items: [],
      })),
    ],
    isReady: false,
  });

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const rootStyle = window.getComputedStyle(document.documentElement);
    const rawFontFamily = rootStyle.getPropertyValue("--font-inter").trim();
    const resolvedFontFamily = rawFontFamily || designManifest.typography.fonts.sans;

    const baseFont = `400 ${LAYOUT_CONFIG.FONT_SIZE}px ${resolvedFontFamily}`;
    const boldFont = `700 ${LAYOUT_CONFIG.FONT_SIZE}px ${resolvedFontFamily}`;
    const italicFont = `italic 400 ${LAYOUT_CONFIG.FONT_SIZE}px ${resolvedFontFamily}`;
    const codeFont = `500 ${LAYOUT_CONFIG.FONT_SIZE - 1}px monospace`;

    const data: Record<string, PreparedData> = {};
    for (const study of allItems) {
      const parsedItems = parseMarkdownToRichItems(study.editorial_content, baseFont, boldFont, italicFont, codeFont);
      const prepared = prepareRichInline(parsedItems);
      let paddingHeight = study.githubStats ? LAYOUT_CONFIG.PADDING_WITH_STATS : LAYOUT_CONFIG.PADDING_WITHOUT_STATS;
      
      if (study.badges && Array.isArray(study.badges) && study.badges.length > 0) {
        paddingHeight += LAYOUT_CONFIG.PADDING_BADGES;
      }
      
      data[study.id] = {
        prepared,
        items: parsedItems,
        paddingHeight,
      };
    }
    
    preparedDataRef.current = data;
  }, [allItems]);

  const recalculateLayout = useCallback((containerWidth: number) => {
    if (Object.keys(preparedDataRef.current).length === 0) return;

    const { colCount, columns } = calculateMasonryLayout(
      containerWidth,
      filteredItems,
      preparedDataRef.current,
      LAYOUT_CONFIG
    );

    setLayoutState({
      colCount,
      columns,
      isReady: true,
    });
  }, [filteredItems]);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        containerWidthRef.current = entry.contentRect.width;
        recalculateLayout(entry.contentRect.width);
      }
    });

    resizeObserver.observe(containerRef.current);

    const initialWidth = containerRef.current.getBoundingClientRect().width;
    containerWidthRef.current = initialWidth;
    recalculateLayout(initialWidth);

    return () => {
      resizeObserver.disconnect();
    };
  }, [recalculateLayout]);

  useLayoutEffect(() => {
    if (containerWidthRef.current > 0) {
      recalculateLayout(containerWidthRef.current);
    }
  }, [filteredItems, recalculateLayout]);

  return { containerRef, layoutState };
}

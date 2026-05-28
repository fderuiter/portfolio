import { useState, useLayoutEffect, useRef, useCallback } from "react";
import { designManifest } from "@/lib/design-manifest";
import { 
  parseMarkdownToRichItems, 
  type ExtendedRichInlineItem 
} from "@/hooks/usePretextLayout";
import { 
  prepareRichInline, 
  walkRichInlineLineRanges, 
  materializeRichInlineLineRange,
  type PreparedRichInline,
  type RichInlineLine,
  type RichInlineLineRange
} from "@chenglou/pretext/rich-inline";
import { LAYOUT_CONFIG } from "@/lib/layout-config";
import { GitHubStats } from "@/lib/github";

export interface MasonryItem {
  id: string;
  editorial_content: string;
  githubStats?: GitHubStats | null;
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
  const preparedDataRef = useRef<Record<string, {
    prepared: PreparedRichInline;
    items: ExtendedRichInlineItem[];
    paddingHeight: number;
  }>>({});

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

    const data: Record<string, {
      prepared: PreparedRichInline;
      items: ExtendedRichInlineItem[];
      paddingHeight: number;
    }> = {};
    for (const study of allItems) {
      const parsedItems = parseMarkdownToRichItems(study.editorial_content, baseFont, boldFont, italicFont, codeFont);
      const prepared = prepareRichInline(parsedItems);
      const paddingHeight = study.githubStats ? LAYOUT_CONFIG.PADDING_WITH_STATS : LAYOUT_CONFIG.PADDING_WITHOUT_STATS;
      
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

    let colCount: number = LAYOUT_CONFIG.COLS.SM;
    if (containerWidth >= LAYOUT_CONFIG.BREAKPOINTS.LG) {
      colCount = LAYOUT_CONFIG.COLS.LG;
    } else if (containerWidth >= LAYOUT_CONFIG.BREAKPOINTS.MD) {
      colCount = LAYOUT_CONFIG.COLS.MD;
    }

    const columnWidth = (containerWidth - (LAYOUT_CONFIG.GAP * (colCount - 1))) / colCount;

    const itemsWithHeight = filteredItems.map((study) => {
      const cached = preparedDataRef.current[study.id];
      if (!cached) {
        return { ...study, height: LAYOUT_CONFIG.FALLBACK_ITEM_HEIGHT, lines: [], items: [] };
      }

      const linesRanges: RichInlineLineRange[] = [];
      walkRichInlineLineRanges(cached.prepared, columnWidth - (LAYOUT_CONFIG.CARD_PADDING * 2), (range) => {
        linesRanges.push(range);
      });

      const materializedLines = linesRanges.map((range) =>
        materializeRichInlineLineRange(cached.prepared, range)
      );

      const textHeight = materializedLines.length * LAYOUT_CONFIG.LINE_HEIGHT;
      const totalHeight = textHeight + cached.paddingHeight;

      return {
        ...study,
        height: totalHeight,
        lines: materializedLines,
        items: cached.items,
      };
    });

    const columns: (T & { height: number; lines: RichInlineLine[]; items: ExtendedRichInlineItem[] })[][] = Array.from({ length: colCount }, () => []);
    const columnHeights = Array(colCount).fill(0);

    for (const study of itemsWithHeight) {
      let minColIdx = 0;
      let minHeight = columnHeights[0];
      for (let i = 1; i < colCount; i++) {
        if (columnHeights[i] < minHeight) {
          minHeight = columnHeights[i];
          minColIdx = i;
        }
      }

      columns[minColIdx].push(study);
      columnHeights[minColIdx] += study.height + LAYOUT_CONFIG.GAP;
    }

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

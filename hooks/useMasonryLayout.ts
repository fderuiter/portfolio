import { useState, useLayoutEffect, useRef, useCallback } from "react";
import { useResizeObserver } from "./useResizeObserver";
import { 
  parseMarkdownToRichItems, 
  type ExtendedRichInlineItem 
} from "@/hooks/usePretextLayout";
import { 
  prepareRichInline, 
  type RichInlineLine,
} from "@chenglou/pretext/rich-inline";
import { LAYOUT_CONFIG, resolveThemeFonts } from "@/lib/layout-config";
import { GitHubStats } from "@/lib/github";
import { calculateMasonryLayout, type PreparedData } from "@/lib/masonry";
import { isBrowser } from "@/lib/graphics-engine";
import { useBentoLayout } from "@/components/providers/BentoLayoutContext";

export interface MasonryItem {
  id: string;
  editorial_content: string;
  githubStats?: GitHubStats | null;
}

export interface LayoutItem<T extends MasonryItem> {
  item: T;
  height: number;
  paragraphsLines: RichInlineLine[][];
  paragraphsItems: ExtendedRichInlineItem[][];
}

export function useMasonryLayout<T extends MasonryItem>(
  allItems: T[],
  filteredItems: T[]
) {
  const { heightOverrides } = useBentoLayout();
  const containerWidthRef = useRef<number>(0);
  const preparedDataRef = useRef<Record<string, PreparedData>>({});

  const [layoutState, setLayoutState] = useState<{
    colCount: number;
    columns: (T & { height: number; paragraphsLines: RichInlineLine[][]; paragraphsItems: ExtendedRichInlineItem[][] })[][];
    isReady: boolean;
  }>({
    colCount: LAYOUT_CONFIG.COLS.SM,
    columns: [
      allItems.map((s) => ({
        ...s,
        height: LAYOUT_CONFIG.FALLBACK_ITEM_HEIGHT,
        paragraphsLines: [],
        paragraphsItems: [],
      })),
    ],
    isReady: false,
  });

  const recalculateLayout = useCallback((containerWidth: number) => {
    if (Object.keys(preparedDataRef.current).length === 0) return;

    const { colCount, columns } = calculateMasonryLayout(
      containerWidth,
      filteredItems,
      preparedDataRef.current,
      LAYOUT_CONFIG,
      heightOverrides
    );

    setLayoutState({
      colCount,
      columns,
      isReady: true,
    });
  }, [filteredItems, heightOverrides]);

  useLayoutEffect(() => {
    if (!isBrowser()) return;

    const { baseFont, boldFont, italicFont, codeFont } = resolveThemeFonts(LAYOUT_CONFIG.FONT_SIZE, "--font-inter");

    const data: Record<string, PreparedData> = {};
    for (const study of allItems) {
      const paragraphTexts = study.editorial_content.split(/\r?\n+/).map(p => p.trim()).filter(Boolean);
      const paragraphs = paragraphTexts.map((text) => {
        const parsedItems = parseMarkdownToRichItems(text, baseFont, boldFont, italicFont, codeFont);
        const prepared = prepareRichInline(parsedItems);
        return {
          prepared,
          items: parsedItems,
        };
      });

      const paddingHeight = study.githubStats ? LAYOUT_CONFIG.PADDING_WITH_STATS : LAYOUT_CONFIG.PADDING_WITHOUT_STATS;
      
      data[study.id] = {
        paragraphs,
        paddingHeight,
      };
    }
    
    preparedDataRef.current = data;
    recalculateLayout(containerWidthRef.current);
  }, [allItems, recalculateLayout]);

  const containerRef = useResizeObserver<HTMLDivElement>((entry) => {
    containerWidthRef.current = entry.contentRect.width;
    recalculateLayout(entry.contentRect.width);
  });

  useLayoutEffect(() => {
    if (containerWidthRef.current > 0) {
      recalculateLayout(containerWidthRef.current);
    }
  }, [filteredItems, recalculateLayout]);

  return { containerRef, layoutState };
}

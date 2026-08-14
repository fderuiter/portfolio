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
import { 
  isBrowser,
  textPrepareCache,
  textLayoutCache,
  richItemsCache,
  richPrepareCache,
  richLayoutCache
} from "@/lib/graphics-engine";
import { clearCache } from "@chenglou/pretext";
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
  }, [allItems]);

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

  const containerRef = useResizeObserver<HTMLDivElement>((entry) => {
    containerWidthRef.current = entry.contentRect.width;
    recalculateLayout(entry.contentRect.width);
  });

  useLayoutEffect(() => {
    if (containerRef.current) {
      const initialWidth = containerRef.current.getBoundingClientRect().width;
      containerWidthRef.current = initialWidth;
      recalculateLayout(initialWidth);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    if (containerWidthRef.current > 0) {
      recalculateLayout(containerWidthRef.current);
    }
  }, [filteredItems, recalculateLayout]);

  useLayoutEffect(() => {
    if (!isBrowser()) return;
    if (typeof document !== "undefined" && document.fonts) {
      let active = true;
      document.fonts.ready.then(() => {
        if (!active) return;

        // Clear all global layout caches
        textPrepareCache.clear();
        textLayoutCache.clear();
        richItemsCache.clear();
        richPrepareCache.clear();
        richLayoutCache.clear();
        clearCache();

        // Re-resolve font styles with the loaded fonts
        const { baseFont, boldFont, italicFont, codeFont } = resolveThemeFonts(LAYOUT_CONFIG.FONT_SIZE, "--font-inter");

        // Re-prepare all paragraphs
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

        // Recalculate layout heights with precise dimensions
        if (containerWidthRef.current > 0) {
          recalculateLayout(containerWidthRef.current);
        }
      });
      return () => {
        active = false;
      };
    }
  }, [allItems, recalculateLayout]);

  return { containerRef, layoutState };
}

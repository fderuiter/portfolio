import { useState, useLayoutEffect, useRef, useCallback } from "react";
import { type RichInlineLine } from "@chenglou/pretext/rich-inline";
import { GitHubStats } from "@/lib/github";
import { 
  generateManifest, 
  EngineConfig, 
  type EngineToken
} from "@/lib/engine";

export interface MasonryItem {
  id: string;
  editorial_content: string;
  githubStats?: GitHubStats | null;
}

export function useMasonryLayout<T extends MasonryItem>(
  allItems: T[],
  filteredItems: T[]
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const containerWidthRef = useRef<number>(0);

  const [layoutState, setLayoutState] = useState<{
    colCount: number;
    columns: (T & { height: number; lines: RichInlineLine[]; items: EngineToken[] })[][];
    isReady: boolean;
  }>({
    colCount: EngineConfig.COLS.SM,
    columns: [
      allItems.map((s) => ({
        ...s,
        height: EngineConfig.FALLBACK_ITEM_HEIGHT,
        lines: [],
        items: [],
      })),
    ],
    isReady: false,
  });

  const recalculateLayout = useCallback((containerWidth: number) => {
    const manifest = generateManifest<T>({
      items: filteredItems,
      containerWidth,
      getText: (item) => item.editorial_content,
      hasStats: (item) => !!item.githubStats,
      fontFamilyVariable: "--font-inter",
    });

    const flattenedColumns = manifest.columns.map((col) =>
      col.map((ci) => ({
        ...ci.item,
        height: ci.height,
        lines: ci.lines,
        items: ci.items,
      }))
    );

    setLayoutState({
      colCount: manifest.colCount,
      columns: flattenedColumns,
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

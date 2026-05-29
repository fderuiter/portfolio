import { 
  walkRichInlineLineRanges, 
  materializeRichInlineLineRange,
  type PreparedRichInline,
  type RichInlineLine,
  type RichInlineLineRange
} from "@chenglou/pretext/rich-inline";
import { type ExtendedRichInlineItem } from "@/hooks/usePretextLayout";

export interface MasonryConfig {
  COLS: { SM: number; MD: number; LG: number };
  BREAKPOINTS: { MD: number; LG: number };
  GAP: number;
  CARD_PADDING: number;
  LINE_HEIGHT: number;
  FALLBACK_ITEM_HEIGHT: number;
}

export interface PreparedData {
  prepared: PreparedRichInline;
  items: ExtendedRichInlineItem[];
  paddingHeight: number;
}

export function calculateMasonryLayout<T extends { id: string }>(
  containerWidth: number,
  filteredItems: T[],
  preparedData: Record<string, PreparedData>,
  config: MasonryConfig
) {
  let colCount: number = config.COLS.SM;
  if (containerWidth >= config.BREAKPOINTS.LG) {
    colCount = config.COLS.LG;
  } else if (containerWidth >= config.BREAKPOINTS.MD) {
    colCount = config.COLS.MD;
  }

  const columnWidth = (containerWidth - (config.GAP * (colCount - 1))) / colCount;

  const itemsWithHeight = filteredItems.map((study) => {
    const cached = preparedData[study.id];
    if (!cached) {
      return { ...study, height: config.FALLBACK_ITEM_HEIGHT, lines: [], items: [] };
    }

    const linesRanges: RichInlineLineRange[] = [];
    walkRichInlineLineRanges(cached.prepared, columnWidth - (config.CARD_PADDING * 2), (range) => {
      linesRanges.push(range);
    });

    const materializedLines = linesRanges.map((range) =>
      materializeRichInlineLineRange(cached.prepared, range)
    );

    const textHeight = materializedLines.length * config.LINE_HEIGHT;
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
    columnHeights[minColIdx] += study.height + config.GAP;
  }

  return { colCount, columns };
}

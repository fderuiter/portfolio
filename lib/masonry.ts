import { 
  walkRichInlineLineRanges, 
  materializeRichInlineLineRange,
  type PreparedRichInline,
  type RichInlineLineRange
} from "@chenglou/pretext/rich-inline";
import { type ExtendedRichInlineItem } from "@/hooks/usePretextLayout";
import { 
  calculateColumnCount, 
  calculateColumnWidth, 
  distributeItemsGreedily 
} from "@/lib/graphics-engine";

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
  const colCount = calculateColumnCount(containerWidth, config.BREAKPOINTS, config.COLS);
  const columnWidth = calculateColumnWidth(containerWidth, colCount, config.GAP);

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

  const { columns } = distributeItemsGreedily(itemsWithHeight, colCount, config.GAP);

  return { colCount, columns };
}

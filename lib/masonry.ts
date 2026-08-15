import { 
  walkRichInlineLineRanges, 
  materializeRichInlineLineRange,
  type PreparedRichInline,
  type RichInlineLine,
  type RichInlineLineRange
} from "@chenglou/pretext/rich-inline";
import { type ExtendedRichInlineItem } from "@/hooks/usePretextLayout";
import { 
  calculateColumnCount, 
  calculateColumnWidth, 
  distributeItemsGreedily 
} from "@/lib/graphics-math";

export interface MasonryConfig {
  COLS: { SM: number; MD: number; LG: number };
  BREAKPOINTS: { MD: number; LG: number };
  GAP: number;
  CARD_PADDING: number;
  LINE_HEIGHT: number;
  FALLBACK_ITEM_HEIGHT: number;
  MOBILE_PADDING_ADJUSTMENT?: number;
}

export interface PreparedParagraph {
  prepared: PreparedRichInline;
  items: ExtendedRichInlineItem[];
}

export interface PreparedData {
  paragraphs?: PreparedParagraph[];
  paddingHeight: number;
}

export function calculateMasonryLayout<T extends { id: string }>(
  containerWidth: number,
  filteredItems: T[],
  preparedData: Record<string, PreparedData>,
  config: MasonryConfig,
  heightOverrides?: Record<string, number>
) {
  const colCount = calculateColumnCount(containerWidth, config.BREAKPOINTS, config.COLS);
  const columnWidth = calculateColumnWidth(containerWidth, colCount, config.GAP);

  const itemsWithHeight = filteredItems.map((study) => {
    const cached = preparedData[study.id];
    if (!cached) {
      const override = heightOverrides?.[study.id];
      const height = override !== undefined ? override : config.FALLBACK_ITEM_HEIGHT;
      return { ...study, height, paragraphsLines: [], paragraphsItems: [] };
    }

    let totalTextHeight = 0;
    const paragraphsLines: RichInlineLine[][] = [];
    const paragraphsItems: ExtendedRichInlineItem[][] = [];

    const textWidth = columnWidth - (config.CARD_PADDING * 2);

    let paragraphs = cached.paragraphs;
    /* eslint-disable @typescript-eslint/no-explicit-any */
    if (!paragraphs && (cached as any).prepared) {
      paragraphs = [{
        prepared: (cached as any).prepared,
        items: (cached as any).items || [],
      }];
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */

    for (const paragraph of paragraphs || []) {
      const linesRanges: RichInlineLineRange[] = [];
      walkRichInlineLineRanges(paragraph.prepared, textWidth, (range) => {
        linesRanges.push(range);
      });

      const materializedLines = linesRanges.map((range) =>
        materializeRichInlineLineRange(paragraph.prepared, range)
      );

      paragraphsLines.push(materializedLines);
      paragraphsItems.push(paragraph.items);

      const paragraphHeight = materializedLines.length * config.LINE_HEIGHT;
      totalTextHeight += paragraphHeight;
    }

    const PARAGRAPH_GAP = 12;
    if (paragraphs && paragraphs.length > 1) {
      totalTextHeight += (paragraphs.length - 1) * PARAGRAPH_GAP;
    }

    const override = heightOverrides?.[study.id];
    // The single-column card shell is 22px shorter because responsive typography
    // and control wrapping remove one desktop spacing row.
    const responsivePaddingAdjustment = colCount === 1
      ? (config.MOBILE_PADDING_ADJUSTMENT ?? 0)
      : 0;
    const totalHeight = override !== undefined
      ? override
      : totalTextHeight + cached.paddingHeight - responsivePaddingAdjustment;

    return {
      ...study,
      height: totalHeight,
      paragraphsLines,
      paragraphsItems,
    };
  });

  const { columns } = distributeItemsGreedily(itemsWithHeight, colCount, config.GAP);

  return { colCount, columns };
}

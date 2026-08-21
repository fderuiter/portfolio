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
import { 
  calculateBlockHeight, 
  BLOCK_LAYOUT_CONFIG, 
  type PreparedBlock 
} from "@/lib/pretext-block-parser";

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
  blocks?: PreparedBlock[];
  realityBlocks?: PreparedBlock[];
  paddingHeight: number;
}

export function calculateCardHeightFromBlocks(
  blocks: PreparedBlock[],
  textWidth: number,
  paddingHeight: number,
  config: MasonryConfig,
  colCount: number
): number {
  let totalTextHeight = 0;
  for (const block of blocks) {
    if (block.type === "paragraph" && block.prepared) {
      let lineCount = 0;
      walkRichInlineLineRanges(block.prepared, textWidth, () => {
        lineCount++;
      });
      totalTextHeight += lineCount * config.LINE_HEIGHT;
    } else {
      totalTextHeight += calculateBlockHeight(block, textWidth, config.LINE_HEIGHT);
    }
  }
  if (blocks.length > 1) {
    totalTextHeight += (blocks.length - 1) * BLOCK_LAYOUT_CONFIG.PARAGRAPH_GAP;
  }
  const responsivePaddingAdjustment = colCount === 1 ? (config.MOBILE_PADDING_ADJUSTMENT ?? 0) : 0;
  return totalTextHeight + paddingHeight - responsivePaddingAdjustment;
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
      return { ...study, height, preCalculatedRealityHeight: height, paragraphsLines: [], paragraphsItems: [] };
    }

    let totalTextHeight = 0;
    const paragraphsLines: RichInlineLine[][] = [];
    const paragraphsItems: ExtendedRichInlineItem[][] = [];

    const textWidth = columnWidth - (config.CARD_PADDING * 2);

    if (cached.blocks && cached.blocks.length > 0) {
      for (const block of cached.blocks) {
        if (block.type === "paragraph" && block.prepared) {
          const linesRanges: RichInlineLineRange[] = [];
          walkRichInlineLineRanges(block.prepared, textWidth, (range) => {
            linesRanges.push(range);
          });

          const materializedLines = linesRanges.map((range) =>
            materializeRichInlineLineRange(block.prepared!, range)
          );

          paragraphsLines.push(materializedLines);
          if (block.items) paragraphsItems.push(block.items);

          const paragraphHeight = materializedLines.length * config.LINE_HEIGHT;
          totalTextHeight += paragraphHeight;
        } else {
          // Code / Log / Diff structured block
          const blockHeight = calculateBlockHeight(block, textWidth, config.LINE_HEIGHT);
          totalTextHeight += blockHeight;
        }
      }

      const PARAGRAPH_GAP = BLOCK_LAYOUT_CONFIG.PARAGRAPH_GAP;
      if (cached.blocks.length > 1) {
        totalTextHeight += (cached.blocks.length - 1) * PARAGRAPH_GAP;
      }
    } else {
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

      const PARAGRAPH_GAP = BLOCK_LAYOUT_CONFIG.PARAGRAPH_GAP;
      if (paragraphs && paragraphs.length > 1) {
        totalTextHeight += (paragraphs.length - 1) * PARAGRAPH_GAP;
      }
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

    const preCalculatedRealityHeight = cached.realityBlocks && cached.realityBlocks.length > 0
      ? calculateCardHeightFromBlocks(cached.realityBlocks, textWidth, cached.paddingHeight, config, colCount)
      : totalHeight;

    return {
      ...study,
      height: totalHeight,
      preCalculatedRealityHeight,
      paragraphsLines,
      paragraphsItems,
    };
  });

  const { columns } = distributeItemsGreedily(itemsWithHeight, colCount, config.GAP);

  return { colCount, columns };
}


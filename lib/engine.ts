import { designManifest } from "@/lib/design-manifest";
import { 
  type RichInlineLine, 
  type RichInlineItem,
  type RichInlineLineRange,
  type PreparedRichInline,
  prepareRichInline, 
  walkRichInlineLineRanges, 
  materializeRichInlineLineRange 
} from "@chenglou/pretext/rich-inline";

// 1. Centralized Constraints & Magic Numbers
export const EngineConfig = {
  FALLBACK_ITEM_HEIGHT: 250,
  PADDING_WITH_STATS: designManifest.masonry.paddingWithStats,
  PADDING_WITHOUT_STATS: designManifest.masonry.paddingWithoutStats,
  GAP: designManifest.layout.gap,
  CARD_PADDING: designManifest.layout.cardPadding,
  FONT_SIZE: designManifest.typography.sizes.sm.fontSize,
  LINE_HEIGHT: designManifest.typography.sizes.sm.lineHeight,
  FONT_FAMILY: designManifest.typography.fonts.sans,
  BREAKPOINTS: {
    LG: designManifest.breakpoints.lg,
    MD: designManifest.breakpoints.md,
  },
  COLS: {
    LG: 3,
    MD: 2,
    SM: 1,
  }
} as const;

// 2. Transformer
export interface EngineToken extends RichInlineItem {
  type: "text" | "bold" | "italic" | "code";
}

export function tokenizeText(
  text: string,
  baseFont: string,
  boldFont: string,
  italicFont: string,
  codeFont: string
): EngineToken[] {
  const items: EngineToken[] = [];
  const regex = /(\*\*.*?\*\*|`.*?`|\*.*?\*|[^*`\n]+|\n)/g;
  
  let match;
  while ((match = regex.exec(text)) !== null) {
    const raw = match[0];
    if (raw === "\n") {
      items.push({ text: " ", font: baseFont, type: "text" });
    } else if (raw.startsWith("**") && raw.endsWith("**") && raw.length > 4) {
      items.push({ text: raw.slice(2, -2), font: boldFont, type: "bold" });
    } else if (raw.startsWith("`") && raw.endsWith("`") && raw.length > 2) {
      items.push({ text: raw.slice(1, -1), font: codeFont, type: "code", break: "never", extraWidth: 12 });
    } else if (raw.startsWith("*") && raw.endsWith("*") && raw.length > 2) {
      items.push({ text: raw.slice(1, -1), font: italicFont, type: "italic" });
    } else {
      items.push({ text: raw, font: baseFont, type: "text" });
    }
  }
  
  return items;
}

export function getCleanTextFromTokens(tokens: EngineToken[]): string {
  return tokens.map(t => t.text).join("");
}

// 3. Serialized Layout Manifest
export interface LayoutManifestItem<T> {
  item: T;
  height: number;
  lines: RichInlineLine[];
  items: EngineToken[];
}

export interface LayoutManifest<T> {
  colCount: number;
  columns: LayoutManifestItem<T>[][];
}

export interface ManifestOptions<T> {
  items: T[];
  containerWidth: number;
  getText: (item: T) => string;
  hasStats: (item: T) => boolean;
  fontFamilyVariable?: string; // Optional browser metric override
}

// Cache for headless engine performance (60FPS masonry)
class EngineCache<K, V> {
  private cache = new Map<K, V>();
  constructor(private capacity: number) {}
  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    const val = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }
  set(key: K, value: V) {
    if (this.cache.size >= this.capacity && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) this.cache.delete(firstKey);
    }
    this.cache.delete(key);
    this.cache.set(key, value);
  }
}

const tokensCache = new EngineCache<string, EngineToken[]>(500);
const preparedCache = new EngineCache<string, PreparedRichInline>(500);

export function generateManifest<T extends { id: string }>(
  options: ManifestOptions<T>
): LayoutManifest<T> {
  const { items, containerWidth, getText, hasStats, fontFamilyVariable } = options;

  let colCount: number = EngineConfig.COLS.SM;
  if (containerWidth >= EngineConfig.BREAKPOINTS.LG) {
    colCount = EngineConfig.COLS.LG;
  } else if (containerWidth >= EngineConfig.BREAKPOINTS.MD) {
    colCount = EngineConfig.COLS.MD;
  }

  const columnWidth = containerWidth > 0 ? (containerWidth - (EngineConfig.GAP * (colCount - 1))) / colCount : 0;
  const availableTextWidth = Math.max(0, columnWidth - (EngineConfig.CARD_PADDING * 2));

  // Determine font family
  let resolvedFontFamily: string = EngineConfig.FONT_FAMILY;
  if (typeof window !== "undefined" && fontFamilyVariable) {
    const rawFontFamily = window.getComputedStyle(document.documentElement).getPropertyValue(fontFamilyVariable).trim();
    if (rawFontFamily) resolvedFontFamily = rawFontFamily;
  }

  const baseFont = `400 ${EngineConfig.FONT_SIZE}px ${resolvedFontFamily}`;
  const boldFont = `700 ${EngineConfig.FONT_SIZE}px ${resolvedFontFamily}`;
  const italicFont = `italic 400 ${EngineConfig.FONT_SIZE}px ${resolvedFontFamily}`;
  const codeFont = `500 ${EngineConfig.FONT_SIZE - 1}px monospace`;

  const fontsKey = `${baseFont}|${boldFont}|${italicFont}|${codeFont}`;

  const manifestItems: LayoutManifestItem<T>[] = items.map((study) => {
    const text = getText(study);
    const itemsKey = `${text}|${fontsKey}`;

    let tokens = tokensCache.get(itemsKey);
    if (!tokens) {
      tokens = tokenizeText(text, baseFont, boldFont, italicFont, codeFont);
      tokensCache.set(itemsKey, tokens);
    }

    let prepared = preparedCache.get(itemsKey);
    if (!prepared) {
      prepared = prepareRichInline(tokens);
      preparedCache.set(itemsKey, prepared);
    }

    const linesRanges: RichInlineLineRange[] = [];
    walkRichInlineLineRanges(prepared, availableTextWidth, (range) => {
      linesRanges.push(range);
    });

    const materializedLines = linesRanges.map((range) =>
      materializeRichInlineLineRange(prepared!, range)
    );

    const textHeight = materializedLines.length * EngineConfig.LINE_HEIGHT;
    const paddingHeight = hasStats(study) ? EngineConfig.PADDING_WITH_STATS : EngineConfig.PADDING_WITHOUT_STATS;
    const totalHeight = textHeight + paddingHeight;

    return {
      item: study,
      height: totalHeight,
      lines: materializedLines,
      items: tokens,
    };
  });

  const columns: LayoutManifestItem<T>[][] = Array.from({ length: colCount }, () => []);
  const columnHeights = Array(colCount).fill(0);

  // Centralized LPT Scheduler Algorithm
  for (const manifestItem of manifestItems) {
    let minColIdx = 0;
    let minHeight = columnHeights[0];
    for (let i = 1; i < colCount; i++) {
      if (columnHeights[i] < minHeight) {
        minHeight = columnHeights[i];
        minColIdx = i;
      }
    }

    columns[minColIdx].push(manifestItem);
    columnHeights[minColIdx] += manifestItem.height + EngineConfig.GAP;
  }

  return { colCount, columns };
}

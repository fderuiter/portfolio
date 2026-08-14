import { designManifest } from "@/lib/design-manifest";
import { resolveFontFamily } from "@/lib/graphics-engine";

export const LAYOUT_CONFIG = {
  // Height offsets used for fallback and SSR
  FALLBACK_ITEM_HEIGHT: 250,

  // We can pull these from designManifest for consistency but centralize their usage here
  PADDING_WITH_STATS: designManifest.masonry.paddingWithStats,
  PADDING_WITHOUT_STATS: designManifest.masonry.paddingWithoutStats,

  GAP: designManifest.layout.gap,
  CARD_PADDING: designManifest.layout.cardPadding,

  // Typography dimensions for layout calculations
  FONT_SIZE: designManifest.typography.sizes.sm.fontSize,
  LINE_HEIGHT: designManifest.typography.sizes.sm.lineHeight,

  // Column counts based on breakpoints
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

export interface ThemeFonts {
  baseFont: string;
  boldFont: string;
  italicFont: string;
  codeFont: string;
}

export function resolveThemeFonts(
  fontSize: number,
  fontFamilyVariable: string = "--font-inter"
): ThemeFonts {
  const resolvedFontFamily = resolveFontFamily(fontFamilyVariable, designManifest.typography.fonts.sans);
  
  // Try custom font-mono variable, fallback to font-geist-mono, then standard design manifest fallback
  let resolvedMonoFamily = resolveFontFamily("--font-mono", "");
  if (!resolvedMonoFamily) {
    resolvedMonoFamily = resolveFontFamily("--font-geist-mono", designManifest.typography.fonts.mono);
  }

  return {
    baseFont: `400 ${fontSize}px ${resolvedFontFamily}`,
    boldFont: `700 ${fontSize}px ${resolvedFontFamily}`,
    italicFont: `italic 400 ${fontSize}px ${resolvedFontFamily}`,
    codeFont: `500 ${fontSize - 1}px ${resolvedMonoFamily}`,
  };
}

export function resolveSingleThemeFont(
  fontSize: number,
  fontFamilyVariable: string = "--font-inter"
): string {
  const resolvedFontFamily = resolveFontFamily(fontFamilyVariable, designManifest.typography.fonts.sans);
  return `${fontSize}px ${resolvedFontFamily}`;
}

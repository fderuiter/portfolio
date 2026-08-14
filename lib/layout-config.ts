import { designManifest } from "@/lib/design-manifest";

export const LAYOUT_CONFIG = {
  // Height offsets used for fallback and SSR
  FALLBACK_ITEM_HEIGHT: 250,

  // We can pull these from designManifest for consistency but centralize their usage here
  PADDING_WITH_STATS: designManifest.masonry.paddingWithStats,
  PADDING_WITHOUT_STATS: designManifest.masonry.paddingWithoutStats,
  // Mobile cards omit one desktop spacing row in their single-column shell.
  MOBILE_PADDING_ADJUSTMENT: 22,

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
  if (typeof window === "undefined") {
    const fallbackSans = designManifest.typography.fonts.sans;
    const fallbackMono = designManifest.typography.fonts.mono;
    return {
      baseFont: `400 ${fontSize}px ${fallbackSans}`,
      boldFont: `700 ${fontSize}px ${fallbackSans}`,
      italicFont: `italic 400 ${fontSize}px ${fallbackSans}`,
      codeFont: `500 ${fontSize - 1}px ${fallbackMono}`,
    };
  }

  const rootStyle = window.getComputedStyle(document.documentElement);
  
  const rawFontFamily = rootStyle.getPropertyValue(fontFamilyVariable).trim();
  const resolvedFontFamily = rawFontFamily || designManifest.typography.fonts.sans;

  const rawMonoFamily = rootStyle.getPropertyValue("--font-mono").trim() || rootStyle.getPropertyValue("--font-geist-mono").trim();
  const resolvedMonoFamily = rawMonoFamily || designManifest.typography.fonts.mono;

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
  if (typeof window === "undefined") {
    const fallbackSans = designManifest.typography.fonts.sans;
    return `${fontSize}px ${fallbackSans}`;
  }

  const rootStyle = window.getComputedStyle(document.documentElement);
  const rawFontFamily = rootStyle.getPropertyValue(fontFamilyVariable).trim();
  const resolvedFontFamily = rawFontFamily || designManifest.typography.fonts.sans;

  return `${fontSize}px ${resolvedFontFamily}`;
}

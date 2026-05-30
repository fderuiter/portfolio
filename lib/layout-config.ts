import { designManifest } from "@/lib/design-manifest";

export const LAYOUT_CONFIG = {
  // Height offsets used for fallback and SSR
  FALLBACK_ITEM_HEIGHT: 250,

  // We can pull these from designManifest for consistency but centralize their usage here
  PADDING_WITH_STATS: designManifest.masonry.paddingWithStats,
  PADDING_WITHOUT_STATS: designManifest.masonry.paddingWithoutStats,
  PADDING_BADGES: 44, // Added constant for badges row height

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

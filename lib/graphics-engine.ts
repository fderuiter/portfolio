import { designManifest } from "./design-manifest";
import { prepare, layout, type PreparedText } from "@chenglou/pretext";
import { 
  type PreparedRichInline,
  type RichInlineLine,
} from "@chenglou/pretext/rich-inline";
import { LRUCache } from "./graphics-math";

export * from "./graphics-math";

// --- Global Caches ---
export const textPrepareCache = new LRUCache<string, PreparedText>(500);
export const textLayoutCache = new LRUCache<string, { height: number; lineCount: number }>(2000);

export const richItemsCache = new LRUCache<string, unknown[]>(500);
export const richPrepareCache = new LRUCache<string, PreparedRichInline>(500);
export const richLayoutCache = new LRUCache<string, { height: number; lines: RichInlineLine[] }>(2000);

// Bounded style and font caches with strict capacity limits to avoid memory growth
export const cssPropertyCache = new LRUCache<string, string>(100);
export const fontConfigCache = new LRUCache<string, unknown>(100);

// --- Environment and CSS resolution helpers ---

/**
 * Safe browser environment check to prevent SSR failures.
 */
export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * Resolves font family variable dynamically using Computed Style.
 * Returns designManifest sans-serif fallback if run in SSR or variables are missing.
 */
export function resolveFontFamily(variableName: string = "--font-inter"): string {
  if (!isBrowser()) {
    return designManifest.typography.fonts.sans;
  }

  // Intercept repeated queries with the bounded cache
  const cached = cssPropertyCache.get(variableName);
  if (cached !== undefined) {
    return cached;
  }

  try {
    const rootStyle = window.getComputedStyle(document.documentElement);
    const rawFontFamily = rootStyle.getPropertyValue(variableName).trim();
    const resolved = rawFontFamily || designManifest.typography.fonts.sans;
    cssPropertyCache.set(variableName, resolved);
    return resolved;
  } catch {
    return designManifest.typography.fonts.sans;
  }
}

// --- Text Measurement Services ---

/**
 * Offscreen text measurement utilizing Pretext layout calculations.
 * SSR-safe fallback mechanism returns height 0 if running on server.
 */
export function measureTextOffscreen({
  text,
  fontSize,
  lineHeight,
  fontFamilyVariable = "--font-inter",
  maxWidth,
}: {
  text: string;
  fontSize: number;
  lineHeight: number;
  fontFamilyVariable?: string;
  maxWidth: number;
}): { height: number; lineCount: number } {
  if (!isBrowser()) {
    return { height: 0, lineCount: 0 };
  }

  const fontFamily = resolveFontFamily(fontFamilyVariable);
  const fontString = `${fontSize}px ${fontFamily}`;

  const prepareKey = `${text}|${fontString}`;
  let prepared = textPrepareCache.get(prepareKey);
  if (!prepared) {
    prepared = prepare(text, fontString);
    textPrepareCache.set(prepareKey, prepared);
  }

  const flooredWidth = Math.floor(maxWidth);
  const cacheKey = `${text}|${fontString}|${flooredWidth}|${lineHeight}`;
  let result = textLayoutCache.get(cacheKey);
  if (!result) {
    result = layout(prepared, flooredWidth, lineHeight);
    textLayoutCache.set(cacheKey, result);
  }

  return result;
}

/**
 * Expose a layout validation utility that warns in non-production environments
 * when calculated layout height and actual physical DOM measurement differs by more than 2px.
 */
export function validateLayoutHeight(calculated: number, actual: number, contextMessage?: string) {
  if (process.env.NODE_ENV !== "production") {
    const deviation = Math.abs(calculated - actual);
    if (deviation > 2) {
      console.warn(
        `[Layout Validation Warning] Layout drift detected! Calculated height is ${calculated}px, but actual DOM height is ${actual}px (deviation: ${deviation.toFixed(2)}px). ${contextMessage || ""}`
      );
    }
  }
}

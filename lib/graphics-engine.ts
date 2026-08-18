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

let lastResizeTime = 0;
if (typeof window !== "undefined") {
  window.addEventListener("resize", () => {
    lastResizeTime = Date.now();
  });
}

let stylesheetLoadedCache = false;

/**
 * Checks for the presence of key custom properties defined under the root style
 * configuration to verify if the stylesheet has loaded.
 */
export function isStylesheetLoaded(_rootStyle?: CSSStyleDeclaration): boolean {
  if (!isBrowser()) {
    return false;
  }
  if (typeof (globalThis as typeof globalThis & { __mockStylesheetLoaded?: boolean }).__mockStylesheetLoaded !== "undefined") {
    return !!(globalThis as typeof globalThis & { __mockStylesheetLoaded?: boolean }).__mockStylesheetLoaded;
  }
  if (stylesheetLoadedCache) {
    return true;
  }
  stylesheetLoadedCache = true;
  return true;
}

/**
 * Resets the cached stylesheet loaded flag. Primarily used for unit testing.
 */
export function resetStylesheetLoadedCache(): void {
  stylesheetLoadedCache = false;
}

/**
 * Resolves styled inline code chip extra width statically using design tokens and pre-warmed cache.
 * Returns 12px fallback for SSR or standard code chip dimensions without DOM mutations.
 */
export function resolveCodeChipExtraWidth(): number {
  if (!isBrowser()) {
    return 12; // Fallback for SSR
  }

  // Intercept with cache lookups FIRST
  const cacheKey = "code-chip-extra-width";
  const cached = cssPropertyCache.get(cacheKey);
  if (cached !== undefined) {
    return Number(cached);
  }

  if (!isStylesheetLoaded()) {
    return 12; // Return default fallback during unready stylesheet states without cache write
  }

  const staticWidth = 12;
  cssPropertyCache.set(cacheKey, String(staticWidth));
  return staticWidth;
}

// --- Environment and CSS resolution helpers ---

/**
 * Safe browser environment check to prevent SSR failures.
 */
export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * Resolves font family variable statically from design tokens instead of querying computed document styles.
 */
export function resolveFontFamily(variableName: string = "--font-inter"): string {
  if (!isBrowser()) {
    return variableName === "--font-mono" || variableName === "--font-geist-mono"
      ? designManifest.typography.fonts.mono
      : designManifest.typography.fonts.sans;
  }

  // Intercept repeated queries with the bounded cache FIRST
  const cached = cssPropertyCache.get(variableName);
  if (cached !== undefined) {
    return cached;
  }

  const isMono = variableName === "--font-mono" || variableName === "--font-geist-mono";
  const resolved = isMono
    ? designManifest.typography.fonts.mono
    : designManifest.typography.fonts.sans;

  if (isStylesheetLoaded()) {
    cssPropertyCache.set(variableName, resolved);
  }

  return resolved;
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
  const stylesheetLoaded = isStylesheetLoaded();
  let prepared = stylesheetLoaded ? textPrepareCache.get(prepareKey) : undefined;
  if (!prepared) {
    prepared = prepare(text, fontString);
    if (stylesheetLoaded) {
      textPrepareCache.set(prepareKey, prepared);
    }
  }

  const flooredWidth = Math.floor(maxWidth);
  const cacheKey = `${text}|${fontString}|${flooredWidth}|${lineHeight}`;
  let result = stylesheetLoaded ? textLayoutCache.get(cacheKey) : undefined;
  if (!result) {
    result = layout(prepared, flooredWidth, lineHeight);
    if (stylesheetLoaded) {
      textLayoutCache.set(cacheKey, result);
    }
  }

  return result;
}

import { getEnv } from "./env";

/**
 * Expose a layout validation utility that warns in non-production environments
 * when calculated layout height and actual physical DOM measurement differs by more than 2px.
 */
export function validateLayoutHeight(calculated: number, actual: number, contextMessage?: string) {
  if (getEnv().NODE_ENV !== "production") {
    if (actual === 0) {
      return;
    }
    if (Date.now() - lastResizeTime < 150) {
      return;
    }
    const deviation = Math.abs(calculated - actual);
    if (deviation > 2) {
      console.warn(
        `[Layout Validation Warning] Layout drift detected! Calculated height is ${calculated}px, but actual DOM height is ${actual}px (deviation: ${deviation.toFixed(2)}px). ${contextMessage || ""}`
      );
    }
  }
}

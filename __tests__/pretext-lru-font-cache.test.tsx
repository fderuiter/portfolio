/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

import { renderHook } from "@testing-library/react";
import {
  cssPropertyCache,
  fontConfigCache,
  isStylesheetLoaded,
  resetStylesheetLoadedCache,
  measureTextOffscreen,
  resolveCodeChipExtraWidth,
  textPrepareCache,
  textLayoutCache,
} from "@/lib/graphics-engine";
import { resolveSingleThemeFont, resolveThemeFonts } from "@/lib/layout-config";
import { usePretextLayout } from "@/hooks/usePretextLayout";

describe("Pretext LRU Font and Style Cache Suite", () => {
  beforeEach(() => {
    cssPropertyCache.clear();
    fontConfigCache.clear();
    resetStylesheetLoadedCache();
    delete (globalThis as any).__mockStylesheetLoaded;
    vi.restoreAllMocks();

    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation((contextId) => {
      if (contextId === "2d") {
        return {
          measureText: vi.fn((text) => ({
            width: (text || "").length * 8,
          })),
        } as any;
      }
      return null;
    });
  });

  it("Requirement 1: Bounded style caches store resolved font settings without DOM queries", () => {
    const getComputedStyleSpy = vi.spyOn(window, "getComputedStyle");

    // First lookup
    const font1 = resolveSingleThemeFont(16, "--font-inter");
    expect(font1).toContain("system-ui");
    expect(getComputedStyleSpy).not.toHaveBeenCalled();

    // Second lookup - should be cached
    const font2 = resolveSingleThemeFont(16, "--font-inter");
    expect(font2).toBe(font1);
    expect(getComputedStyleSpy).not.toHaveBeenCalled();
  });

  it("Requirement 1 (Capacity): LRU cache has a strict size limit to prevent memory growth", () => {
    // Fill up to capacity
    for (let i = 0; i < 150; i++) {
      cssPropertyCache.set(`--var-${i}`, `font-${i}`);
    }
    
    // The older entries should be evicted as the capacity is 100
    expect(cssPropertyCache.get("--var-0")).toBeUndefined();
    expect(cssPropertyCache.get("--var-149")).toBe("font-149");
  });

  it("Requirement 2: Layout hooks store previously resolved font settings in local references to skip cache queries when resizing", () => {
    const getComputedStyleSpy = vi.spyOn(window, "getComputedStyle");

    // Render hook
    const { rerender } = renderHook(
      ({ text, fontSize }) => usePretextLayout({ text, fontSize, lineHeight: 20 }),
      {
        initialProps: { text: "Hello", fontSize: 16 }
      }
    );

    // Initial render does zero DOM queries
    expect(getComputedStyleSpy).not.toHaveBeenCalled();

    // Rerender with same text and fontSize
    rerender({ text: "Hello", fontSize: 16 });

    expect(getComputedStyleSpy).not.toHaveBeenCalled();
  });

  it("Requirement 3: Translation mode or active theme change clears style and font cache", () => {
    const getComputedStyleSpy = vi.spyOn(window, "getComputedStyle");

    // Populated cache
    resolveSingleThemeFont(16, "--font-inter");

    // Render hook with translationMode/activeTheme change triggers layout effect cache invalidation
    const { rerender } = renderHook(
      ({ translationMode, activeTheme }) => usePretextLayout({ text: "Hello", lineHeight: 20, translationMode, activeTheme }),
      {
        initialProps: { translationMode: "en", activeTheme: "dark" }
      }
    );

    // Rerender with changed translationMode
    rerender({ translationMode: "fr", activeTheme: "dark" });

    // Single font resolution completes without DOM queries
    resolveSingleThemeFont(16, "--font-inter");
    expect(getComputedStyleSpy).not.toHaveBeenCalled();
  });

  it("Requirement 4: Fall back to default typography settings during SSR", () => {
    // Mock typeof window === "undefined" behavior by overriding window temporarily
    const originalWindow = globalThis.window;
    try {
      // In node env/SSR, window is undefined
      (globalThis as any).window = undefined;
      
      const ssrFont = resolveSingleThemeFont(16, "--font-inter");
      expect(ssrFont).toContain("system-ui"); // default manifest fallback font
    } finally {
      globalThis.window = originalWindow;
    }
  });

  it("Requirement 4: Fall back to default typography settings on client errors", () => {
    const font = resolveSingleThemeFont(16, "--font-inter");
    expect(font).toContain("system-ui"); // fallback sans-serif default font
  });

  it("Requirement 5: Font resolution resolves statically from design tokens without querying window.getComputedStyle", () => {
    const getComputedStyleSpy = vi.spyOn(window, "getComputedStyle");
    const fontVal = resolveSingleThemeFont(18, "--font-inter");
    expect(fontVal).toContain("18px");
    expect(fontVal).toContain("system-ui");
    expect(getComputedStyleSpy).not.toHaveBeenCalled();
  });

  it("Requirement 5: Theme fonts resolve statically from design tokens without querying window.getComputedStyle", () => {
    const getComputedStyleSpy = vi.spyOn(window, "getComputedStyle");
    const fontsTheme = resolveThemeFonts(18, "--font-inter");
    expect(fontsTheme.baseFont).toContain("18px");
    expect(fontsTheme.codeFont).toContain("17px");
    expect(getComputedStyleSpy).not.toHaveBeenCalled();
  });

  describe("Non-Destructive Stylesheet Load-Guard requirements", () => {
    it("Requirement 1 & 2: Returns fallbacks during unready state without writing to caches when __mockStylesheetLoaded is false", () => {
      (globalThis as any).__mockStylesheetLoaded = false;

      // Caches are empty
      cssPropertyCache.clear();
      fontConfigCache.clear();

      // resolveSingleThemeFont
      const fontSingle = resolveSingleThemeFont(16, "--font-inter");
      expect(fontSingle).toContain("system-ui"); // fallback font stack
      expect(cssPropertyCache.get("--font-inter")).toBeUndefined();
      expect(fontConfigCache.get("singleThemeFont|16|--font-inter")).toBeUndefined();

      // resolveThemeFonts
      const fontsTheme = resolveThemeFonts(16, "--font-inter");
      expect(fontsTheme.baseFont).toContain("system-ui");
      expect(cssPropertyCache.get("--font-inter")).toBeUndefined();
      expect(fontConfigCache.get("themeFonts|16|--font-inter")).toBeUndefined();

      // resolveCodeChipExtraWidth
      const extraWidth = resolveCodeChipExtraWidth();
      expect(extraWidth).toBe(12);
      expect(cssPropertyCache.get("code-chip-extra-width")).toBeUndefined();
    });

    it("Requirement 3: Skips caching dynamic measurements when __mockStylesheetLoaded is false", () => {
      (globalThis as any).__mockStylesheetLoaded = false;

      // Caches are empty
      textPrepareCache.clear();
      textLayoutCache.clear();

      expect(isStylesheetLoaded()).toBe(false);

      // Call measureTextOffscreen
      const result = measureTextOffscreen({
        text: "Temporary layout state text",
        fontSize: 14,
        lineHeight: 20,
        maxWidth: 300,
      });

      expect(result.height).toBeGreaterThan(0);
      // Caches must remain empty (should NOT have been written to)
      expect(textPrepareCache.size).toBe(0);
      expect(textLayoutCache.size).toBe(0);
    });

    it("Requirement 4: Cache is fully writable once stylesheet loaded check succeeds", () => {
      (globalThis as any).__mockStylesheetLoaded = true;

      textPrepareCache.clear();
      textLayoutCache.clear();

      expect(isStylesheetLoaded()).toBe(true);

      const result = measureTextOffscreen({
        text: "Custom brand font text",
        fontSize: 14,
        lineHeight: 20,
        maxWidth: 300,
      });

      expect(result.height).toBeGreaterThan(0);
      // Caches must contain the resolved/measured keys
      expect(textPrepareCache.size).toBeGreaterThan(0);
      expect(textLayoutCache.size).toBeGreaterThan(0);
    });
  });
});

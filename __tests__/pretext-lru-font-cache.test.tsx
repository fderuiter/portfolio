/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

import { renderHook } from "@testing-library/react";
import { 
  cssPropertyCache, 
  fontConfigCache, 
  resetStylesheetLoadedCache,
  resolveCodeChipExtraWidth,
  isStylesheetLoaded,
  measureTextOffscreen,
  textPrepareCache,
  textLayoutCache
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

  it("Requirement 1: Bounded style caches intercept repeated CSS property queries after the first DOM lookup", () => {
    const getPropertyValueSpy = vi.spyOn(window.CSSStyleDeclaration.prototype, "getPropertyValue");
    getPropertyValueSpy.mockReturnValue("MockInterFamily");

    // First lookup
    const font1 = resolveSingleThemeFont(16, "--font-inter");
    expect(font1).toContain("MockInterFamily");
    expect(getPropertyValueSpy).toHaveBeenCalled();
    const initialCalls = getPropertyValueSpy.mock.calls.length;

    // Second lookup - should be cached and not hit getPropertyValue again
    const font2 = resolveSingleThemeFont(16, "--font-inter");
    expect(font2).toBe(font1);
    expect(getPropertyValueSpy.mock.calls.length).toBe(initialCalls);
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

  it("Requirement 2: Layout hooks store previously resolved font settings in local references to skip DOM/cache queries when resizing", () => {
    const resolveSpy = vi.spyOn(window.CSSStyleDeclaration.prototype, "getPropertyValue");
    resolveSpy.mockReturnValue("MockInterFamily");

    // Render hook
    const { rerender } = renderHook(
      ({ text, fontSize }) => usePretextLayout({ text, fontSize, lineHeight: 20 }),
      {
        initialProps: { text: "Hello", fontSize: 16 }
      }
    );

    // Initial render does the DOM query
    expect(resolveSpy).toHaveBeenCalled();
    const callsAfterInitial = resolveSpy.mock.calls.length;

    // Rerender with same text and fontSize, but different parameters that trigger updates
    rerender({ text: "Hello", fontSize: 16 });

    // It should skip DOM queries because of hook ref caching
    expect(resolveSpy.mock.calls.length).toBe(callsAfterInitial);
  });

  it("Requirement 3: Translation mode or active theme change clears style and font cache", () => {
    const getPropertyValueSpy = vi.spyOn(window.CSSStyleDeclaration.prototype, "getPropertyValue");
    getPropertyValueSpy.mockReturnValue("MockInterFamily");

    // Populated cache
    resolveSingleThemeFont(16, "--font-inter");
    expect(getPropertyValueSpy).toHaveBeenCalled();

    // Render hook with translationMode/activeTheme change triggers layout effect cache invalidation
    const { rerender } = renderHook(
      ({ translationMode, activeTheme }) => usePretextLayout({ text: "Hello", lineHeight: 20, translationMode, activeTheme }),
      {
        initialProps: { translationMode: "en", activeTheme: "dark" }
      }
    );

    // Reset spies
    getPropertyValueSpy.mockClear();

    // Rerender with changed translationMode
    rerender({ translationMode: "fr", activeTheme: "dark" });

    // Caches are cleared, so next resolution must perform DOM query again
    resolveSingleThemeFont(16, "--font-inter");
    expect(getPropertyValueSpy).toHaveBeenCalled();
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
    const getPropertyValueSpy = vi.spyOn(window.CSSStyleDeclaration.prototype, "getPropertyValue");
    getPropertyValueSpy.mockImplementation(() => {
      throw new Error("Simulated client CSS error");
    });

    const font = resolveSingleThemeFont(16, "--font-inter");
    expect(font).toContain("system-ui"); // fallback sans-serif default font on error
  });

  it("Requirement 5: window.getComputedStyle is only queried if both the outer configuration cache and inner individual font family cache miss (single font)", () => {
    // 1. Fully cached in both: should not query style
    cssPropertyCache.set("--font-inter", "MyInterFont");
    fontConfigCache.set("singleThemeFont|18|--font-inter", "18px MyInterFont");
    
    const getComputedStyleSpy = vi.spyOn(window, "getComputedStyle");
    const fontValCached = resolveSingleThemeFont(18, "--font-inter");
    expect(fontValCached).toBe("18px MyInterFont");
    expect(getComputedStyleSpy).not.toHaveBeenCalled();

    // 2. Outer configuration cache miss, but inner individual font family cache hit:
    // Should NOT query getComputedStyle
    fontConfigCache.clear();
    getComputedStyleSpy.mockClear();
    
    const fontValInnerHit = resolveSingleThemeFont(18, "--font-inter");
    expect(fontValInnerHit).toBe("18px MyInterFont");
    expect(getComputedStyleSpy).not.toHaveBeenCalled();

    // 3. Both outer and inner caches miss:
    // Must query getComputedStyle
    cssPropertyCache.clear();
    fontConfigCache.clear();
    getComputedStyleSpy.mockClear();

    const getPropertyValueSpy = vi.spyOn(window.CSSStyleDeclaration.prototype, "getPropertyValue");
    getPropertyValueSpy.mockReturnValue("NewInterFont");

    const fontValBothMiss = resolveSingleThemeFont(18, "--font-inter");
    expect(fontValBothMiss).toBe("18px NewInterFont");
    expect(getComputedStyleSpy).toHaveBeenCalledTimes(1);
    expect(cssPropertyCache.get("--font-inter")).toBe("NewInterFont");
  });

  it("Requirement 5: window.getComputedStyle is only queried if both the outer configuration cache and inner individual font family cache miss (theme fonts)", () => {
    // 1. Fully cached in both: should not query style
    cssPropertyCache.set("--font-inter", "MyInterFont");
    cssPropertyCache.set("--font-mono", "MyMonoFont");
    
    const mockTheme = {
      baseFont: "400 18px MyInterFont",
      boldFont: "700 18px MyInterFont",
      italicFont: "italic 400 18px MyInterFont",
      codeFont: "500 17px MyMonoFont",
    };
    fontConfigCache.set("themeFonts|18|--font-inter", mockTheme);

    const getComputedStyleSpy = vi.spyOn(window, "getComputedStyle");
    const resultCached = resolveThemeFonts(18, "--font-inter");
    expect(resultCached).toEqual(mockTheme);
    expect(getComputedStyleSpy).not.toHaveBeenCalled();

    // 2. Outer configuration cache miss, but inner individual font family cache hit:
    // Should NOT query getComputedStyle
    fontConfigCache.clear();
    getComputedStyleSpy.mockClear();

    const resultInnerHit = resolveThemeFonts(18, "--font-inter");
    expect(resultInnerHit).toEqual(mockTheme);
    expect(getComputedStyleSpy).not.toHaveBeenCalled();

    // 3. Inner cache partial miss (one matches, one misses):
    // Must query getComputedStyle
    cssPropertyCache.clear();
    cssPropertyCache.set("--font-inter", "MyInterFont"); // only inter is present, mono is missing
    fontConfigCache.clear();
    getComputedStyleSpy.mockClear();

    const getPropertyValueSpy = vi.spyOn(window.CSSStyleDeclaration.prototype, "getPropertyValue");
    getPropertyValueSpy.mockReturnValue("NewMonoFont");

    const resultPartialMiss = resolveThemeFonts(18, "--font-inter");
    expect(getComputedStyleSpy).toHaveBeenCalledTimes(1);
    expect(resultPartialMiss.codeFont).toContain("NewMonoFont");
  });

  describe("Non-Destructive Stylesheet Load-Guard requirements", () => {
    it("Requirement 1 & 2: Checks presence of root variables to verify stylesheet loaded, and returns default fallbacks during unready state without writing to caches", () => {
      // Mock unready stylesheet state (all root style queries return empty string)
      const getPropertyValueSpy = vi.spyOn(window.CSSStyleDeclaration.prototype, "getPropertyValue");
      getPropertyValueSpy.mockReturnValue("");

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

    it("Requirement 3: Skips caching dynamic measurements for temporary DOM elements until stylesheet loads", () => {
      // Mock unready stylesheet
      const getPropertyValueSpy = vi.spyOn(window.CSSStyleDeclaration.prototype, "getPropertyValue");
      getPropertyValueSpy.mockReturnValue("");

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
      // Mock ready stylesheet
      const getPropertyValueSpy = vi.spyOn(window.CSSStyleDeclaration.prototype, "getPropertyValue");
      getPropertyValueSpy.mockImplementation((prop) => {
        if (prop === "--layout-gap") return "16px";
        if (prop === "--brand-cyan") return "#06b6d4";
        if (prop === "--font-size-sm") return "13px";
        if (prop === "--font-inter") return "MyCustomBrandFont";
        return "";
      });

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

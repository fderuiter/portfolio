import { describe, it, expect } from "vitest";
import {
  formatNumber,
  formatPercent,
  formatCurrency,
  formatCompactNumber,
  roundToDecimals,
} from "../lib/utils";

describe("Standardized i18n Number Formatting Utilities (lib/utils.ts)", () => {
  describe("formatNumber", () => {
    it("formats standard numbers with default grouping", () => {
      expect(formatNumber(1234567.89)).toBe("1,234,567.89");
      expect(formatNumber(0)).toBe("0");
    });

    it("supports fixed decimals number argument", () => {
      expect(formatNumber(1234.5678, 2)).toBe("1,234.57");
      expect(formatNumber(42, 2)).toBe("42.00");
      expect(formatNumber(3.14159, 0)).toBe("3");
    });

    it("supports custom options object with decimals and grouping", () => {
      expect(formatNumber(1234.5, { decimals: 2, useGrouping: false })).toBe(
        "1234.50"
      );
    });

    it("handles null, undefined, and NaN safely", () => {
      expect(formatNumber(null)).toBe("");
      expect(formatNumber(undefined)).toBe("");
      expect(formatNumber(NaN)).toBe("");
    });
  });

  describe("formatPercent", () => {
    it("formats ratio numbers (0-1) as percentages by default", () => {
      expect(formatPercent(0.85, 1)).toBe("85.0%");
      expect(formatPercent(0.85, 0)).toBe("85%");
      expect(formatPercent(1.0, 0)).toBe("100%");
      expect(formatPercent(0, 0)).toBe("0%");
    });

    it("handles raw percentages (>1) auto-converting or with isRatio: false", () => {
      expect(formatPercent(85.5, 1)).toBe("85.5%");
      expect(formatPercent(85, { decimals: 0, isRatio: false })).toBe("85%");
    });

    it("handles null, undefined, and NaN safely", () => {
      expect(formatPercent(null)).toBe("");
      expect(formatPercent(undefined)).toBe("");
      expect(formatPercent(NaN)).toBe("");
    });
  });

  describe("formatCurrency", () => {
    it("formats currency values in USD by default", () => {
      expect(formatCurrency(13500)).toBe("$13,500.00");
      expect(formatCurrency(13500, { decimals: 0 })).toBe("$13,500");
    });

    it("supports passing currency code string or options", () => {
      expect(formatCurrency(100, "EUR")).toBe("€100.00");
      expect(formatCurrency(100, { currency: "GBP", decimals: 2 })).toBe(
        "£100.00"
      );
    });

    it("handles null, undefined, and NaN safely", () => {
      expect(formatCurrency(null)).toBe("");
      expect(formatCurrency(undefined)).toBe("");
      expect(formatCurrency(NaN)).toBe("");
    });
  });

  describe("formatCompactNumber", () => {
    it("formats numbers using compact notation", () => {
      expect(formatCompactNumber(1200)).toBe("1.2K");
      expect(formatCompactNumber(1500000)).toBe("1.5M");
    });

    it("handles null, undefined, and NaN safely", () => {
      expect(formatCompactNumber(null)).toBe("");
      expect(formatCompactNumber(undefined)).toBe("");
      expect(formatCompactNumber(NaN)).toBe("");
    });
  });

  describe("roundToDecimals", () => {
    it("rounds numbers mathematically to specified decimal places", () => {
      expect(roundToDecimals(12.3456, 2)).toBe(12.35);
      expect(roundToDecimals(12.3411, 2)).toBe(12.34);
      expect(roundToDecimals(10.5, 0)).toBe(11);
    });

    it("handles non-number inputs safely", () => {
      expect(roundToDecimals(NaN)).toBe(0);
    });
  });
});

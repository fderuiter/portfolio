import { describe, it, expect } from "vitest";
import {
  clampColumnSpan,
  sanitizeFieldColumnSpans,
  calculateRowBoundaries,
  calculateRowRelativeMoveIndex,
  reorderFieldWithRowSplice,
  spliceFieldIntoSection,
} from "@/lib/crf/grid-reorder";
import { CRFField } from "@/lib/crf/types";

describe("CRF Grid Row Boundary & Adaptive Splice Math Engine", () => {
  const createMockField = (id: string, columnSpan: number): CRFField => ({
    id,
    variableName: id.toUpperCase(),
    label: `Field ${id}`,
    dataType: "text",
    columnSpan,
    required: false,
  });

  describe("clampColumnSpan & sanitizeFieldColumnSpans", () => {
    it("clamps column spans to valid 1..12 range across edge values", () => {
      expect(clampColumnSpan(0)).toBe(1);
      expect(clampColumnSpan(-5)).toBe(1);
      expect(clampColumnSpan(15)).toBe(12);
      expect(clampColumnSpan(6)).toBe(6);
      expect(clampColumnSpan(null)).toBe(12);
      expect(clampColumnSpan(undefined)).toBe(12);
      expect(clampColumnSpan(NaN)).toBe(12);
    });

    it("sanitizes all fields in an array to maintain valid spans (1..12)", () => {
      const rawFields = [
        createMockField("f1", 0),
        createMockField("f2", 18),
        createMockField("f3", 4),
      ];
      const sanitized = sanitizeFieldColumnSpans(rawFields);
      expect(sanitized[0].columnSpan).toBe(1);
      expect(sanitized[1].columnSpan).toBe(12);
      expect(sanitized[2].columnSpan).toBe(4);
    });
  });

  describe("calculateRowBoundaries", () => {
    it("partitions flat field array into rows based on 12-column fill capacity", () => {
      // Row 0: f1(4) + f2(4) + f3(4) = 12 cols
      // Row 1: f4(6) + f5(6) = 12 cols
      // Row 2: f6(12) = 12 cols
      const fields = [
        createMockField("f1", 4),
        createMockField("f2", 4),
        createMockField("f3", 4),
        createMockField("f4", 6),
        createMockField("f5", 6),
        createMockField("f6", 12),
      ];

      const rows = calculateRowBoundaries(fields, 12);
      expect(rows).toHaveLength(3);

      expect(rows[0].rowIndex).toBe(0);
      expect(rows[0].startIndex).toBe(0);
      expect(rows[0].endIndex).toBe(2);
      expect(rows[0].totalSpan).toBe(12);
      expect(rows[0].columnOffsets).toEqual([0, 4, 8]);

      expect(rows[1].rowIndex).toBe(1);
      expect(rows[1].startIndex).toBe(3);
      expect(rows[1].endIndex).toBe(4);
      expect(rows[1].totalSpan).toBe(12);
      expect(rows[1].columnOffsets).toEqual([0, 6]);

      expect(rows[2].rowIndex).toBe(2);
      expect(rows[2].startIndex).toBe(5);
      expect(rows[2].endIndex).toBe(5);
      expect(rows[2].totalSpan).toBe(12);
      expect(rows[2].columnOffsets).toEqual([0]);
    });

    it("handles partially filled rows cleanly", () => {
      // Row 0: f1(3) + f2(3) = 6 cols
      // Row 1: f3(8) = 8 cols
      const fields = [
        createMockField("f1", 3),
        createMockField("f2", 3),
        createMockField("f3", 8),
      ];

      const rows = calculateRowBoundaries(fields, 12);
      expect(rows).toHaveLength(2);
      expect(rows[0].totalSpan).toBe(6);
      expect(rows[1].totalSpan).toBe(8);
    });

    it("returns empty array for empty field list", () => {
      expect(calculateRowBoundaries([])).toEqual([]);
    });
  });

  describe("calculateRowRelativeMoveIndex", () => {
    it("shifts field across cumulative row boundaries when moving UP", () => {
      // Row 0: f1(4), f2(4), f3(4) -> indices 0, 1, 2
      // Row 1: f4(6), f5(6) -> indices 3, 4
      const fields = [
        createMockField("f1", 4),
        createMockField("f2", 4),
        createMockField("f3", 4),
        createMockField("f4", 6),
        createMockField("f5", 6),
      ];

      // f4 is at index 3 (start of Row 1, offset 0..6).
      // Moving f4 UP should jump across Row 1 boundary into Row 0.
      const targetIndex = calculateRowRelativeMoveIndex(fields, 3, "up", 12);
      expect(targetIndex).toBeLessThan(3);
      expect(targetIndex).toBeGreaterThanOrEqual(0);
    });

    it("shifts field across cumulative row boundaries when moving DOWN", () => {
      // Row 0: f1(4), f2(4), f3(4) -> indices 0, 1, 2
      // Row 1: f4(6), f5(6) -> indices 3, 4
      const fields = [
        createMockField("f1", 4),
        createMockField("f2", 4),
        createMockField("f3", 4),
        createMockField("f4", 6),
        createMockField("f5", 6),
      ];

      // f1 is at index 0 (Row 0, offset 0..4).
      // Moving f1 DOWN should jump into Row 1 across Row 0 boundary.
      const targetIndex = calculateRowRelativeMoveIndex(fields, 0, "down", 12);
      expect(targetIndex).toBeGreaterThan(2);
    });
  });

  describe("reorderFieldWithRowSplice & spliceFieldIntoSection", () => {
    it("reorders fields in flat array cleanly without losing items", () => {
      const fields = [
        createMockField("f1", 6),
        createMockField("f2", 6),
        createMockField("f3", 12),
      ];

      const reordered = reorderFieldWithRowSplice(fields, 2, 0);
      expect(reordered.map((f) => f.id)).toEqual(["f3", "f1", "f2"]);
    });

    it("splices field from source section to target section with column span sanitization", () => {
      const source = [createMockField("s1", 6), createMockField("s2", 15)];
      const target = [createMockField("t1", 4)];

      const { updatedSourceFields, updatedTargetFields } = spliceFieldIntoSection(
        source,
        target,
        1, // s2
        0, // top of target
        false
      );

      expect(updatedSourceFields).toHaveLength(1);
      expect(updatedSourceFields[0].id).toBe("s1");

      expect(updatedTargetFields).toHaveLength(2);
      expect(updatedTargetFields[0].id).toBe("s2");
      expect(updatedTargetFields[0].columnSpan).toBe(12); // clamped from 15
      expect(updatedTargetFields[1].id).toBe("t1");
    });
  });
});

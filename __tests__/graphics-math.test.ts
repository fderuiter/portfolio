import { describe, it, expect } from "vitest";
import { 
  calculateColumnCount, 
  calculateColumnWidth, 
  distributeItemsGreedily,
  mapDataToCoordinates,
  generateCubicSplinePath,
  LRUCache,
  normalizeCanvasCoordinates,
  extractClientCoordinates,
  getCanvasEventCoordinates,
  TouchMouseDeduplicator,
  globalTouchDeduplicator
} from "@/lib/graphics-math";

describe("Graphics Math Isolation Library (Browser-Free)", () => {
  describe("Environment Isolation Check", () => {
    it("runs correctly without window or document definitions", () => {
      // Temporarily stash globals if they exist in standard test environment (like jsdom)
      const oldWindow = globalThis.window;
      const oldDocument = globalThis.document;
      
      try {
        // @ts-expect-error - testing environment-free behavior
        delete globalThis.window;
        // @ts-expect-error - testing environment-free behavior
        delete globalThis.document;

        // Perform mathematical steps
        const points = mapDataToCoordinates([10, 20, 30], 100, 50, 5);
        expect(points).toHaveLength(3);

        const paths = generateCubicSplinePath(points, 100);
        expect(paths.pathD).toBeDefined();
        expect(paths.areaD).toBeDefined();

        const colCount = calculateColumnCount(800, { MD: 768, LG: 1024 }, { SM: 1, MD: 2, LG: 3 });
        expect(colCount).toBe(2);

        const colWidth = calculateColumnWidth(800, 2, 10);
        expect(colWidth).toBe(395);
      } finally {
        // Restore globals
        if (oldWindow) globalThis.window = oldWindow;
        if (oldDocument) globalThis.document = oldDocument;
      }
    });
  });

  describe("A. LRUCache Support", () => {
    it("can cache values and clear successfully", () => {
      const cache = new LRUCache<string, number>(3);
      cache.set("a", 1);
      cache.set("b", 2);
      cache.set("c", 3);
      expect(cache.get("a")).toBe(1);

      cache.set("d", 4); // Evicts "b" since "a" was accessed and is now most-recently used
      expect(cache.get("b")).toBeUndefined();
      expect(cache.get("a")).toBe(1);

      cache.clear();
      expect(cache.get("a")).toBeUndefined();
    });
  });

  describe("B. Masonry Math", () => {
    it("distributes items greedily into shortest columns", () => {
      const items = [
        { id: "1", height: 100 },
        { id: "2", height: 150 },
        { id: "3", height: 80 },
        { id: "4", height: 120 }
      ];

      const { columns, columnHeights } = distributeItemsGreedily(items, 2, 10);
      expect(columns).toHaveLength(2);
      expect(columnHeights[0]).toBe(200);
      expect(columnHeights[1]).toBe(290);
    });
  });

  describe("C. SVG Spline", () => {
    it("generates correct spline paths", () => {
      const points = [{ x: 0, y: 50 }, { x: 50, y: 100 }];
      const paths = generateCubicSplinePath(points, 200);
      expect(paths.pathD).toBe("M 0 50 C 25 50, 25 100, 50 100");
    });
  });

  describe("D. Shared Coordinate Normalization", () => {
    it("normalizes client coordinates to internal canvas resolution with scaling and offsets", () => {
      const rect = { left: 50, top: 100, width: 400, height: 300 };
      const dimensions = { width: 800, height: 600 };

      // Screen client position at center of canvas: (250, 250)
      // Relative offset: (200, 150), scale factor 2x
      const coords = normalizeCanvasCoordinates(250, 250, rect, dimensions);
      expect(coords).toEqual({ x: 400, y: 300 });
    });

    it("clamps normalized coordinates when clampToBounds is true", () => {
      const rect = { left: 0, top: 0, width: 200, height: 200 };
      const dimensions = { width: 400, height: 400 };

      const coordsClamped = normalizeCanvasCoordinates(250, -50, rect, dimensions, true);
      expect(coordsClamped).toEqual({ x: 400, y: 0 });
    });

    it("handles zero dimensions or missing rect gracefully", () => {
      // @ts-expect-error testing edge cases
      expect(normalizeCanvasCoordinates(10, 10, null, { width: 100, height: 100 })).toEqual({ x: 0, y: 0 });
      expect(normalizeCanvasCoordinates(10, 10, { left: 0, top: 0, width: 0, height: 100 }, { width: 100, height: 100 })).toEqual({ x: 0, y: 0 });
    });

    it("extracts client coordinates uniformly from mouse or touch events", () => {
      const mouseEvent = { clientX: 120, clientY: 240 };
      expect(extractClientCoordinates(mouseEvent)).toEqual({ x: 120, y: 240 });

      const touchEvent = {
        touches: [{ clientX: 150, clientY: 300 }],
      };
      expect(extractClientCoordinates(touchEvent)).toEqual({ x: 150, y: 300 });

      const changedTouchEvent = {
        changedTouches: [{ clientX: 180, clientY: 360 }],
      };
      expect(extractClientCoordinates(changedTouchEvent)).toEqual({ x: 180, y: 360 });

      expect(extractClientCoordinates({} as unknown as MouseEvent)).toBeNull();
    });

    it("calculates identical target positions for both mouse and touch inputs at same screen location", () => {
      const mockCanvas = {
        getBoundingClientRect: () => ({ left: 20, top: 40, width: 300, height: 200 }),
        width: 600,
        height: 400,
      };

      const mouseEvent = { clientX: 170, clientY: 140 };
      const touchEvent = { touches: [{ clientX: 170, clientY: 140 }] };

      const mouseResult = getCanvasEventCoordinates(mouseEvent, mockCanvas);
      const touchResult = getCanvasEventCoordinates(touchEvent, mockCanvas);

      expect(mouseResult).toEqual({ x: 300, y: 200 });
      expect(touchResult).toEqual({ x: 300, y: 200 });
      expect(mouseResult).toEqual(touchResult);
    });
  });

  describe("E. TouchMouseDeduplicator", () => {
    it("suppresses synthetic mouse events within the threshold window after a touch event", () => {
      const deduplicator = new TouchMouseDeduplicator(500);
      const now = 10000;

      deduplicator.recordTouch(now);

      // Within 500ms
      expect(deduplicator.shouldSuppressMouseEvent(now + 200)).toBe(true);
      expect(deduplicator.shouldSuppressMouseEvent(now + 499)).toBe(true);

      // After 500ms
      expect(deduplicator.shouldSuppressMouseEvent(now + 501)).toBe(false);

      deduplicator.reset();
      expect(deduplicator.shouldSuppressMouseEvent(now + 100)).toBe(false);
    });

    it("operates with global singleton deduplicator", () => {
      globalTouchDeduplicator.reset();
      expect(globalTouchDeduplicator.shouldSuppressMouseEvent()).toBe(false);
      globalTouchDeduplicator.recordTouch();
      expect(globalTouchDeduplicator.shouldSuppressMouseEvent()).toBe(true);
      globalTouchDeduplicator.reset();
    });
  });
});

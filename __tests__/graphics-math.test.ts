import { describe, it, expect } from "vitest";
import { 
  calculateColumnCount, 
  calculateColumnWidth, 
  distributeItemsGreedily,
  mapDataToCoordinates,
  generateCubicSplinePath,
  generateHermiteSplinePath,
  checkBeamContainerCollision,
  calculateCollisionPoint,
  generateExplosionTrajectories,
  LRUCache
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
});

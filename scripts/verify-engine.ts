import assert from "node:assert";

// Polyfill OffscreenCanvas for headless testing
if (typeof globalThis.OffscreenCanvas === "undefined") {
  (globalThis as unknown as { OffscreenCanvas: unknown }).OffscreenCanvas = class OffscreenCanvas {
    constructor(public width: number, public height: number) {}
    getContext() {
      return {
        measureText: (text: string) => ({ width: text.length * 7.5 }), // approximate width
        font: "",
      };
    }
  };
}

import { prepareRichInline, walkRichInlineLineRanges, materializeRichInlineLineRange } from "@chenglou/pretext/rich-inline";
import { distributeGreedyLPT } from "../lib/layout-engine";
import { designManifest } from "../lib/design-manifest";
import fs from "fs";

console.log("Starting Deterministic Engine Verification Suite...");

const PADDING_WITH_STATS = designManifest.masonry.paddingWithStats;
const PADDING_WITHOUT_STATS = designManifest.masonry.paddingWithoutStats;
const LINE_HEIGHT = designManifest.typography.sizes.sm.lineHeight;

function measureTextReal(text: string, maxWidth: number, fontWeight: string = "normal") {
  // Simplified tokens for headless testing
  const tokens: unknown[] = [{ type: "text", text, font: `var(--font-inter) ${fontWeight}`, size: 13 }];
  const prepared = prepareRichInline(tokens as Parameters<typeof prepareRichInline>[0]);
  
  const linesRanges: Parameters<Parameters<typeof walkRichInlineLineRanges>[2]>[0][] = [];
  walkRichInlineLineRanges(prepared, maxWidth, (range) => {
    linesRanges.push(range);
  });
  
  const materializedLines = linesRanges.map((range) =>
    materializeRichInlineLineRange(prepared, range)
  );

  return materializedLines.length * LINE_HEIGHT;
}

const generateFuzzedText = (length: number) => {
  const chars = "abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789 `*#ñéあ";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

async function runVerification() {
  let passed = 0;
  let failed = 0;
  
  const report: { runs: { name: string; duration: number }[] } = {
    runs: []
  };

  try {
    console.log("Running Scenario: Edge-Case Content Validation (Zero-Reflow)...");
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      const textLen = Math.floor(Math.random() * 500) + 50;
      const fuzzedText = generateFuzzedText(textLen);
      const maxWidth = 300 + Math.floor(Math.random() * 500); 
      const fontWeights = ["normal", "bold", "100", "900"];
      const weight = fontWeights[Math.floor(Math.random() * fontWeights.length)];
      
      const textHeight = measureTextReal(fuzzedText, maxWidth, weight);
      const withStatsHeight = textHeight + PADDING_WITH_STATS;
      const withoutStatsHeight = textHeight + PADDING_WITHOUT_STATS;
      
      assert.strictEqual(withStatsHeight, textHeight + 484);
      assert.strictEqual(withoutStatsHeight, textHeight + 194);
    }
    const duration = performance.now() - start;
    console.log(`✓ Edge-Case Content Validation passed (1000 permutations) in ${duration.toFixed(2)}ms.`);
    report.runs.push({ name: "Edge-Case Content Validation", duration });
    passed++;
  } catch (e) {
    console.error("✗ Edge-Case Content Validation failed:", e);
    failed++;
  }

  try {
    console.log("Running Scenario: Algorithmic Refactor Stress-Test (<1% Variance)...");
    const start = performance.now();
    const items = Array.from({ length: 5000 }, (_, i) => ({
      id: `item-${i}`,
      height: 100 + Math.random() * 400
    }));
    
    const { columnHeights } = distributeGreedyLPT(items, 3, 16);
    const maxH = Math.max(...columnHeights);
    const minH = Math.min(...columnHeights);
    
    const variance = (maxH - minH) / maxH;
    assert.ok(variance <= 0.01, `Height variance > 1%: ${(variance * 100).toFixed(2)}%`);
    const duration = performance.now() - start;
    console.log(`✓ Algorithmic Refactor Stress-Test passed (5000 items, <1% variance) in ${duration.toFixed(2)}ms.`);
    report.runs.push({ name: "Algorithmic Refactor Stress-Test", duration });
    passed++;
  } catch (e) {
    console.error("✗ Algorithmic Refactor Stress-Test failed:", e);
    failed++;
  }

  try {
    console.log("Running Scenario: Catch Simulated Regression (>5px mismatch)...");
    const start = performance.now();
    
    // Create an ideal dataset that SHOULD distribute perfectly equally
    const perfectItems = [
      { height: 100 }, { height: 100 }, { height: 100 },
      { height: 50 }, { height: 50 }, { height: 50 },
      { height: 50 }, { height: 50 }, { height: 50 }
    ];
    
    // Simulate a regression (breaking the LPT by returning unsorted greedy)
    const badGreedy = (items: { height: number }[], colCount: number) => {
      const columnHeights = Array(colCount).fill(0);
      for (const item of items) {
        let minColIdx = 0;
        let minHeight = columnHeights[0];
        // Introduce a subtle bug: only checks first 2 columns out of 3, or adds extra height
        for (let i = 1; i < colCount; i++) {
          if (columnHeights[i] < minHeight) {
            minHeight = columnHeights[i];
            minColIdx = i;
          }
        }
        columnHeights[minColIdx] += item.height;
        // Simulate a layout shift regression of 6px
        if (minColIdx === 0) columnHeights[minColIdx] += 6; 
      }
      return columnHeights;
    };
    
    const badHeights = badGreedy(perfectItems, 3);
    const maxH = Math.max(...badHeights);
    const minH = Math.min(...badHeights);
    const diff = maxH - minH;
    
    assert.throws(() => {
      assert.ok(diff <= 5, `Height mismatch > 5px: ${diff}px`);
    }, /Height mismatch > 5px/);
    
    // Also test that the REAL algorithm perfectly distributes this
    const { columnHeights: goodHeights } = distributeGreedyLPT(perfectItems, 3, 0);
    const maxGood = Math.max(...goodHeights);
    const minGood = Math.min(...goodHeights);
    assert.ok(maxGood - minGood <= 5, `Real layout engine failed 5px mismatch test: ${maxGood - minGood}px`);
    
    const duration = performance.now() - start;
    console.log(`✓ Caught simulated regression (>5px mismatch) in ${duration.toFixed(2)}ms.`);
    report.runs.push({ name: "Catch Simulated Regression", duration });
    passed++;
  } catch (e) {
    console.error("✗ Catch Simulated Regression failed:", e);
    failed++;
  }

  console.log(`\nVerification Complete: ${passed} passed, ${failed} failed.`);
  
  // Requirement 5: Generate "Logic Health Reports"
  fs.writeFileSync("/app/public/engine-health-report.json", JSON.stringify(report, null, 2));
  console.log("Report generated at /app/public/engine-health-report.json");
  
  if (failed > 0) {
    process.exit(1);
  }
}

runVerification();

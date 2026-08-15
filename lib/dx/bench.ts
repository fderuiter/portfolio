import { performance } from "perf_hooks";
import { distributeItemsGreedily } from "../graphics-engine";
import { 
  prepareRichInline, 
  walkRichInlineLineRanges, 
  materializeRichInlineLineRange,
  type RichInlineLineRange 
} from "@chenglou/pretext/rich-inline";
import { scanFile } from "../validation-scanner";
import { colors, formatSection, renderTable } from "./utils";
import path from "path";
import fs from "fs";

export interface BenchmarkResult {
  suite: string;
  name: string;
  iterations: number;
  durationMs: number;
  opsPerSec: number;
  metrics?: Record<string, string | number>;
}

/**
 * Benchmark Greedy Masonry Column Distribution
 */
export function benchmarkMasonryScheduler(iterations = 1000): BenchmarkResult[] {
  const sizes = [100, 1000, 10000];
  const results: BenchmarkResult[] = [];

  for (const size of sizes) {
    const mockItems = Array.from({ length: size }, (_, i) => ({
      id: `item-${i}`,
      height: 150 + (i % 7) * 45 + ((i * 13) % 80),
    }));

    const colCount = 3;
    const gap = 16;

    const start = performance.now();
    for (let it = 0; it < iterations; it++) {
      distributeItemsGreedily(mockItems, colCount, gap);
    }
    const duration = performance.now() - start;
    const opsPerSec = Math.round((iterations * 1000) / duration);

    // Run one calculation to extract final column distribution height variance
    const finalRun = distributeItemsGreedily(mockItems, colCount, gap);
    const maxH = Math.max(...finalRun.columnHeights);
    const minH = Math.min(...finalRun.columnHeights);
    const variance = maxH - minH;

    results.push({
      suite: "Masonry Scheduler",
      name: `Greedy Column Pack (${size.toLocaleString()} items, ${colCount} cols)`,
      iterations,
      durationMs: Number(duration.toFixed(2)),
      opsPerSec,
      metrics: {
        "Items/Run": size,
        "Total Ops/sec": opsPerSec.toLocaleString(),
        "Height Variance": `${variance}px`,
      },
    });
  }

  return results;
}

interface MockCanvas2DContext {
  font: string;
  measureText: (text: string) => { width: number };
}

function ensureCanvasContext(): void {
  if (typeof globalThis.document === "undefined") {
    // If running in pure Node CLI environment
    const mockGlobal = globalThis as unknown as {
      document: {
        createElement: (tag: string) => { getContext?: (type: string) => MockCanvas2DContext };
      };
    };
    mockGlobal.document = {
      createElement: (tag: string) => {
        if (tag === "canvas") {
          return {
            getContext: () => ({
              font: "",
              measureText: (text: string) => ({ width: text.length * 8.5 }),
            }),
          };
        }
        return {};
      },
    };
  } else if (typeof HTMLCanvasElement !== "undefined") {
    // In JSDOM or browser
    const origGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string) {
      try {
        const res = origGetContext ? origGetContext.call(this, type as "2d") : null;
        if (res) return res;
      } catch {
        // ignore
      }
      if (type === "2d") {
        return {
          font: "",
          measureText: (text: string) => ({ width: text.length * 8.5 }),
        } as unknown as CanvasRenderingContext2D;
      }
      return null;
    } as unknown as typeof HTMLCanvasElement.prototype.getContext;
  }
}

/**
 * Benchmark Pretext Rich Inline Text Measurement and Layout
 */
export function benchmarkPretextLayout(iterations = 2000): BenchmarkResult[] {
  ensureCanvasContext();
  const defaultFont = "16px Inter, sans-serif";
  const boldFont = "bold 16px Inter, sans-serif";
  const monoFont = "14px monospace";

  const sampleParagraph = [
    { text: "Pioneering systems engineering architecture with ", font: defaultFont },
    { text: "zero-whitespace", font: boldFont },
    { text: " masonry layout physics and ", font: defaultFont },
    { text: "chenglou/pretext", font: monoFont, extraWidth: 12, break: "never" as const },
    { text: " mathematical layout engines to prevent DOM reflow thrashing.", font: defaultFont },
  ];

  const prepared = prepareRichInline(sampleParagraph);
  const containerWidth = 420;

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    const ranges: RichInlineLineRange[] = [];
    walkRichInlineLineRanges(prepared, containerWidth, (range) => {
      ranges.push(range);
    });
    ranges.map((r) => materializeRichInlineLineRange(prepared, r));
  }
  const duration = performance.now() - start;
  const opsPerSec = Math.round((iterations * 1000) / duration);

  return [
    {
      suite: "Pretext Layout Engine",
      name: "Rich Inline Walk & Materialize (5 styled segments)",
      iterations,
      durationMs: Number(duration.toFixed(2)),
      opsPerSec,
      metrics: {
        "Container Width": `${containerWidth}px`,
        "Throughput": `${opsPerSec.toLocaleString()} lines/sec`,
        "Latency / Layout": `${(duration / iterations).toFixed(4)}ms`,
      },
    },
  ];
}

/**
 * Benchmark Security Validation Scanner
 */
export function benchmarkScanner(iterations = 100): BenchmarkResult[] {
  // Create a mock temp file or use existing file
  const testFile = path.resolve(process.cwd(), "ARCHITECTURE.md");
  let fileContent = "";
  if (fs.existsSync(testFile)) {
    fileContent = fs.readFileSync(testFile, "utf-8");
  } else {
    fileContent = "Sample text\n".repeat(500);
  }

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    scanFile(testFile);
  }
  const duration = performance.now() - start;
  const opsPerSec = Math.round((iterations * 1000) / duration);

  return [
    {
      suite: "Security Scanner",
      name: "Regex Credential & Entropy Scan (ARCHITECTURE.md)",
      iterations,
      durationMs: Number(duration.toFixed(2)),
      opsPerSec,
      metrics: {
        "File Size": `${(fileContent.length / 1024).toFixed(1)} KB`,
        "Scans/sec": opsPerSec.toLocaleString(),
        "Latency / Scan": `${(duration / iterations).toFixed(3)}ms`,
      },
    },
  ];
}

/**
 * Run All Benchmarks
 */
export function runAllBenchmarks(): BenchmarkResult[] {
  const allResults: BenchmarkResult[] = [
    ...benchmarkMasonryScheduler(),
    ...benchmarkPretextLayout(),
    ...benchmarkScanner(),
  ];

  return allResults;
}

export function printBenchmarkReport(results: BenchmarkResult[]): void {
  console.log(formatSection("Micro-Benchmark & Performance Profiles"));

  const rows = results.map((r) => ({
    suite: r.suite,
    benchmark: r.name,
    iterations: r.iterations.toLocaleString(),
    duration: `${r.durationMs}ms`,
    ops: `${r.opsPerSec.toLocaleString()} ops/s`,
  }));

  console.log(
    renderTable(
      [
        { header: "Suite", key: "suite", width: 22 },
        { header: "Benchmark Test", key: "benchmark", width: 42 },
        { header: "Iters", key: "iterations", width: 8, align: "right" },
        { header: "Total Time", key: "duration", width: 12, align: "right" },
        { header: "Throughput", key: "ops", width: 18, align: "right" },
      ],
      rows
    )
  );

  console.log(`${colors.dim}Detailed Metrics:${colors.reset}`);
  for (const r of results) {
    if (r.metrics) {
      const metricStr = Object.entries(r.metrics)
        .map(([k, v]) => `${k}: ${colors.cyan}${v}${colors.reset}`)
        .join(" | ");
      console.log(`  ${colors.bold}${r.name}${colors.reset}: ${metricStr}`);
    }
  }
}

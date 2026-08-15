import { describe, it, expect } from "vitest";
import {
  benchmarkMasonryScheduler,
  benchmarkPretextLayout,
  benchmarkScanner,
  runAllBenchmarks,
} from "@/lib/dx/bench";

describe("DX Micro-Benchmark Suite", () => {
  it("benchmarks masonry column scheduler with various sizes", () => {
    const results = benchmarkMasonryScheduler(50);
    expect(results.length).toBe(3); // 100, 1000, 10000 items

    for (const r of results) {
      expect(r.opsPerSec).toBeGreaterThan(0);
      expect(r.durationMs).toBeGreaterThan(0);
      expect(r.metrics?.["Height Variance"]).toBeDefined();
    }
  });

  it("benchmarks pretext rich inline layout", () => {
    const results = benchmarkPretextLayout(100);
    expect(results.length).toBe(1);
    expect(results[0].opsPerSec).toBeGreaterThan(0);
    expect(results[0].metrics?.["Throughput"]).toBeDefined();
  });

  it("benchmarks security validation scanner", () => {
    const results = benchmarkScanner(10);
    expect(results.length).toBe(1);
    expect(results[0].opsPerSec).toBeGreaterThan(0);
  });

  it("runs all benchmarks cleanly and returns aggregate summary", () => {
    const results = runAllBenchmarks();
    expect(results.length).toBeGreaterThanOrEqual(5);
  });
});

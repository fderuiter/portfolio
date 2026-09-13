import { describe, expect, it, vi } from "vitest";
import {
  runProductionBenchmark,
  type BenchmarkExecutionDependencies,
} from "../lib/dx/benchmark-runner";
import type { PageBenchmarkSummary } from "../lib/dx/page-bench";

function passingRoute(): PageBenchmarkSummary {
  return {
    route: { path: "/", name: "Homepage", category: "top-level" },
    runs: 1,
    ttfb: { median: 120, min: 120, max: 120, p95: 120 },
    fcp: { median: 300, min: 300, max: 300, p95: 300 },
    lcp: { median: 650, min: 650, max: 650, p95: 650 },
    cls: { median: 0, min: 0, max: 0, p95: 0 },
    domContentLoaded: { median: 250, min: 250, max: 250, p95: 250 },
    loadDuration: { median: 750, min: 750, max: 750, p95: 750 },
    transferSizeKb: { median: 140, min: 140, max: 140, p95: 140 },
    ratings: { ttfb: "good", fcp: "good", lcp: "good", cls: "good" },
    passedBudget: true,
  };
}

function dependencies(overrides: Partial<BenchmarkExecutionDependencies> = {}) {
  const stop = vi.fn(async () => undefined);
  const source = { revision: "abc123", dirty: false };
  return {
    stop,
    dependencies: {
      inspectSource: vi.fn(() => source),
      buildProduction: vi.fn(async () => ({
        buildId: "build-123",
        diagnostics: "production build complete",
        completedAt: "2026-09-09T12:00:00.000Z",
      })),
      startProductionServer: vi.fn(async () => ({
        stop,
        diagnostics: () => "server started",
        isReady: () => true,
      })),
      waitForServer: vi.fn(async () => ({
        ready: true,
        diagnostics: "ready in 110ms",
      })),
      runPageBenchmarks: vi.fn(async () => [passingRoute()]),
      now: () => new Date("2026-09-09T12:05:00.000Z"),
      ...overrides,
    } satisfies BenchmarkExecutionDependencies,
  };
}

describe("production benchmark runner", () => {
  it("rejects an invalid target before building or starting a server", async () => {
    const setup = dependencies();

    await expect(
      runProductionBenchmark(
        { url: "http://example.com:3000", runs: 1, routes: ["/"] },
        setup.dependencies
      )
    ).rejects.toThrow(/local/i);

    expect(setup.dependencies.buildProduction).not.toHaveBeenCalled();
    expect(setup.dependencies.startProductionServer).not.toHaveBeenCalled();
  });

  it("preserves startup diagnostics and closes an owned server after a failed startup", async () => {
    const setup = dependencies({
      waitForServer: vi.fn(async () => ({
        ready: false,
        diagnostics: "Error: listen EADDRINUSE: address already in use :::4312",
      })),
    });

    await expect(
      runProductionBenchmark(
        { url: "http://localhost:4312", runs: 1, routes: ["/"] },
        setup.dependencies
      )
    ).rejects.toThrow(/EADDRINUSE/);

    expect(setup.stop).toHaveBeenCalledOnce();
    expect(setup.dependencies.runPageBenchmarks).not.toHaveBeenCalled();
  });

  it("rejects a responding target unless the owned production server reports ready", async () => {
    const occupiedStop = vi.fn(async () => undefined);
    const setup = dependencies({
      startProductionServer: vi.fn(async () => ({
        stop: occupiedStop,
        diagnostics: () =>
          "Error: listen EADDRINUSE: address already in use :::4312",
        isReady: () => false,
      })),
      waitForServer: vi.fn(async () => ({
        ready: true,
        diagnostics: "HTTP 200 from existing target",
      })),
    });

    await expect(
      runProductionBenchmark(
        { url: "http://localhost:4312", runs: 1, routes: ["/"] },
        setup.dependencies
      )
    ).rejects.toThrow(/owned production server/i);

    expect(setup.dependencies.runPageBenchmarks).not.toHaveBeenCalled();
    expect(occupiedStop).toHaveBeenCalledOnce();
  });

  it("emits complete evidence and closes its server after a valid production run", async () => {
    const setup = dependencies();

    const evidence = await runProductionBenchmark(
      { url: "http://localhost:4312", runs: 1, routes: ["/"], isMobile: false },
      setup.dependencies
    );

    expect(evidence).toMatchObject({
      mode: "production",
      source: { revision: "abc123", dirty: false },
      build: { mode: "production", fresh: true, buildId: "build-123" },
      target: { port: 4312, ownership: "benchmark", serverMode: "production" },
      assertion: { budgetEnabled: true, expectedRoutes: ["/"] },
    });
    expect(setup.stop).toHaveBeenCalledOnce();
  });
});

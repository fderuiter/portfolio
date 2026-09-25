import {
  createBenchmarkTarget,
  validateBenchmarkEvidence,
  type BenchmarkEvidence,
  type BenchmarkTarget,
} from "./benchmark-evidence";
import type { PageBenchmarkSummary } from "./page-bench";

export interface BenchmarkSourceState {
  revision: string;
  dirty: boolean;
}

export interface ProductionBuildResult {
  buildId: string;
  diagnostics: string;
  completedAt: string;
}

export interface OwnedBenchmarkServer {
  stop: () => Promise<void>;
  diagnostics: () => string;
  isReady: () => boolean;
}

export interface ServerReadiness {
  ready: boolean;
  diagnostics: string;
}

export interface ProductionBenchmarkOptions {
  url: string;
  runs: number;
  routes: string[];
  isMobile?: boolean;
  throttled?: boolean;
}

/** Injectable side effects keep production lifecycle behavior testable. */
export interface BenchmarkExecutionDependencies {
  inspectSource: () => BenchmarkSourceState;
  buildProduction: (
    source: BenchmarkSourceState
  ) => Promise<ProductionBuildResult>;
  startProductionServer: (
    target: BenchmarkTarget
  ) => Promise<OwnedBenchmarkServer>;
  waitForServer: (target: BenchmarkTarget) => Promise<ServerReadiness>;
  runPageBenchmarks: (input: {
    baseUrl: string;
    runs: number;
    isMobile: boolean;
    throttled?: boolean;
  }) => Promise<PageBenchmarkSummary[]>;
  now?: () => Date;
}

function browserSettings(isMobile: boolean, throttled = false) {
  return isMobile
    ? {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        throttled,
      }
    : {
        viewport: { width: 1280, height: 800 },
        isMobile: false,
        hasTouch: false,
        throttled,
      };
}

/**
 * Builds, owns, measures, validates, and always cleans up a production server.
 * It intentionally has no path for reusing an arbitrary responding server.
 */
export async function runProductionBenchmark(
  options: ProductionBenchmarkOptions,
  dependencies: BenchmarkExecutionDependencies
): Promise<BenchmarkEvidence> {
  const target = createBenchmarkTarget(options.url);
  const sourceBeforeBuild = dependencies.inspectSource();
  if (sourceBeforeBuild.dirty) {
    throw new Error(
      "Production benchmark assertions require a clean source tree."
    );
  }

  const build = await dependencies.buildProduction(sourceBeforeBuild);
  let server: OwnedBenchmarkServer | null = null;

  try {
    server = await dependencies.startProductionServer(target);
    const readiness = await dependencies.waitForServer(target);
    if (!server.isReady()) {
      throw new Error(
        `Owned production server did not report ready: ${server.diagnostics()}`
      );
    }
    if (!readiness.ready) {
      throw new Error(
        `Production server failed to become ready: ${readiness.diagnostics}`
      );
    }

    const summaries = await dependencies.runPageBenchmarks({
      baseUrl: target.url,
      runs: options.runs,
      isMobile: options.isMobile ?? false,
      throttled: options.throttled ?? false,
    });
    const sourceAfterMeasurement = dependencies.inspectSource();
    const capturedAt = (dependencies.now?.() ?? new Date()).toISOString();
    const viewport = browserSettings(
      options.isMobile ?? false,
      options.throttled ?? false
    );
    const evidence: BenchmarkEvidence = {
      version: 1,
      mode: "production",
      capturedAt,
      source: sourceAfterMeasurement,
      build: {
        mode: "production",
        fresh: true,
        sourceRevision: sourceBeforeBuild.revision,
        sourceDirty: sourceBeforeBuild.dirty,
        buildId: build.buildId,
        command: "npm run build",
        completedAt: build.completedAt,
      },
      target: {
        ...target,
        ownership: "benchmark",
        serverMode: "production",
        startupDiagnostics: `${build.diagnostics}\n${server.diagnostics()}\n${readiness.diagnostics}`,
      },
      browser: { engine: "chromium", headless: true, ...viewport },
      sampling: { warmupRuns: 1, measuredRuns: options.runs },
      assertion: { budgetEnabled: true, expectedRoutes: options.routes },
      routes: summaries,
    };
    const validation = validateBenchmarkEvidence(evidence, {
      revision: sourceAfterMeasurement.revision,
      dirty: sourceAfterMeasurement.dirty,
      now: dependencies.now?.(),
    });
    if (!validation.valid) {
      throw new Error(
        `Production benchmark evidence rejected: ${validation.errors.join(" ")}`
      );
    }
    return evidence;
  } finally {
    if (server) {
      await server.stop();
    }
  }
}

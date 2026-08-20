import fs from "fs";
import path from "path";
import zlib from "zlib";
import type { DiagnosticCheckResult } from "./doctor";

export interface ChunkInfo {
  name: string;
  relativePath: string;
  rawBytes: number;
  gzipBytes: number;
  isInitial: boolean;
}

export interface BundleBudgetReport {
  isBuilt: boolean;
  totalChunks: number;
  totalRawBytes: number;
  totalGzipBytes: number;
  initialSharedGzipBytes: number;
  chunks: ChunkInfo[];
  violations: string[];
}

export const DEFAULT_BUDGETS = {
  maxInitialSharedGzip: 400 * 1024, // 400 KB
  maxSingleChunkGzip: 350 * 1024, // 350 KB
};

/**
 * Inspects .next build output chunks and evaluates gzip sizes and budget limits.
 */
export function inspectBundleChunks(workspaceRoot: string): BundleBudgetReport {
  const nextDir = path.join(workspaceRoot, ".next");
  const buildManifestPath = path.join(nextDir, "build-manifest.json");

  if (!fs.existsSync(nextDir) || !fs.existsSync(buildManifestPath)) {
    return {
      isBuilt: false,
      totalChunks: 0,
      totalRawBytes: 0,
      totalGzipBytes: 0,
      initialSharedGzipBytes: 0,
      chunks: [],
      violations: [],
    };
  }

  let buildManifest: { pages?: Record<string, string[]> } = {};
  try {
    buildManifest = JSON.parse(fs.readFileSync(buildManifestPath, "utf-8"));
  } catch {
    // Malformed manifest
  }

  const chunksDir = path.join(nextDir, "static", "chunks");
  const chunks: ChunkInfo[] = [];
  const violations: string[] = [];

  if (fs.existsSync(chunksDir)) {
    const findChunksRecursively = (dir: string): string[] => {
      const files: string[] = [];
      const list = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of list) {
        const full = path.join(dir, item.name);
        if (item.isDirectory()) {
          files.push(...findChunksRecursively(full));
        } else if (item.name.endsWith(".js") || item.name.endsWith(".css")) {
          files.push(full);
        }
      }
      return files;
    };

    const chunkFiles = findChunksRecursively(chunksDir);

    // Initial chunks identified from root '/' or app root
    const rootChunks = new Set(buildManifest.pages?.["/"] || []);

    let initialSharedGzip = 0;
    let totalRaw = 0;
    let totalGzip = 0;

    for (const file of chunkFiles) {
      const relative = path.relative(nextDir, file);
      const rawContent = fs.readFileSync(file);
      const rawBytes = rawContent.length;
      const gzipBytes = zlib.gzipSync(rawContent).length;

      const isInitial = rootChunks.has(relative) || relative.includes("webpack-") || relative.includes("main-");

      if (isInitial) {
        initialSharedGzip += gzipBytes;
      }

      totalRaw += rawBytes;
      totalGzip += gzipBytes;

      const chunkInfo: ChunkInfo = {
        name: path.basename(file),
        relativePath: relative,
        rawBytes,
        gzipBytes,
        isInitial,
      };

      if (gzipBytes > DEFAULT_BUDGETS.maxSingleChunkGzip) {
        violations.push(
          `Chunk '${path.basename(file)}' (${(gzipBytes / 1024).toFixed(1)} kB gzip) exceeds maximum chunk budget of ${(DEFAULT_BUDGETS.maxSingleChunkGzip / 1024).toFixed(0)} kB.`
        );
      }

      chunks.push(chunkInfo);
    }

    if (initialSharedGzip > DEFAULT_BUDGETS.maxInitialSharedGzip) {
      violations.push(
        `Initial shared bundle (${(initialSharedGzip / 1024).toFixed(1)} kB gzip) exceeds maximum initial budget of ${(DEFAULT_BUDGETS.maxInitialSharedGzip / 1024).toFixed(0)} kB.`
      );
    }

    // Sort descending by gzip size
    chunks.sort((a, b) => b.gzipBytes - a.gzipBytes);

    return {
      isBuilt: true,
      totalChunks: chunks.length,
      totalRawBytes: totalRaw,
      totalGzipBytes: totalGzip,
      initialSharedGzipBytes: initialSharedGzip,
      chunks,
      violations,
    };
  }

  return {
    isBuilt: true,
    totalChunks: 0,
    totalRawBytes: 0,
    totalGzipBytes: 0,
    initialSharedGzipBytes: 0,
    chunks: [],
    violations: [],
  };
}

/**
 * Inspects standalone JavaScript bundle assets in public/ and checks budget limits.
 */
export function inspectStandaloneBundle(workspaceRoot: string): { exists: boolean; sizeBytes: number; violation?: string } {
  const targetPath = path.join(workspaceRoot, "public", "garmin-engine.js");
  if (!fs.existsSync(targetPath)) {
    return { exists: false, sizeBytes: 0 };
  }
  const stats = fs.statSync(targetPath);
  const maxBytes = 50 * 1024;
  let violation: string | undefined;
  if (stats.size > maxBytes) {
    violation = `Standalone JavaScript asset 'garmin-engine.js' (${(stats.size / 1024).toFixed(1)} kB) exceeds maximum budget of 50.0 kB.`;
  }
  return { exists: true, sizeBytes: stats.size, violation };
}

/**
 * Diagnostic check for bundle performance budgets in doctor.ts.
 */
export function checkBundleBudgets(root: string): DiagnosticCheckResult {
  const report = inspectBundleChunks(root);
  const standaloneReport = inspectStandaloneBundle(root);

  if (standaloneReport.exists && standaloneReport.violation) {
    report.violations.push(standaloneReport.violation);
  }

  if (!report.isBuilt) {
    if (standaloneReport.violation) {
      return {
        id: "bundle-performance-budgets",
        name: "Production Bundle & Chunk Performance Budgets",
        category: "quality",
        status: "warn",
        message: `Standalone JS artifact exceeded defined 50KB size budget.`,
        details: [standaloneReport.violation],
      };
    }
    return {
      id: "bundle-performance-budgets",
      name: "Production Bundle & Chunk Performance Budgets",
      category: "quality",
      status: "pass",
      message: "No production build artifacts found (.next). Budget assertion active upon build.",
    };
  }

  if (report.violations.length > 0) {
    return {
      id: "bundle-performance-budgets",
      name: "Production Bundle & Chunk Performance Budgets",
      category: "quality",
      status: "warn",
      message: `${report.violations.length} bundle chunk(s) exceeded defined performance budgets.`,
      details: report.violations,
    };
  }

  return {
    id: "bundle-performance-budgets",
    name: "Production Bundle & Chunk Performance Budgets",
    category: "quality",
    status: "pass",
    message: `All ${report.totalChunks} production chunks comply with performance budgets (Total Gzip: ${(report.totalGzipBytes / 1024).toFixed(1)} kB).`,
  };
}

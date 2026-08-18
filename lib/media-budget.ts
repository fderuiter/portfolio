import fs from "fs";
import path from "path";
import type { DiagnosticCheckResult } from "./dx/doctor";

export interface MediaBudgetConfig {
  /** Maximum allowed size in bytes for an individual static media file. Default: 3MB (3,145,728 bytes) */
  maxSingleFileBytes: number;
  /** Maximum allowed aggregate size in bytes for all static media files combined. Default: 10MB (10,485,760 bytes) */
  maxAggregateBytes: number;
  /** File extensions categorized as static media assets */
  mediaExtensions: string[];
  /** Relative directory paths to scan for static media assets (default: ['public']) */
  scanDirectories: string[];
}

export interface MediaFileInfo {
  relativePath: string;
  filename: string;
  sizeBytes: number;
  extension: string;
}

export interface MediaBudgetReport {
  scannedFilesCount: number;
  totalSizeBytes: number;
  files: MediaFileInfo[];
  violations: string[];
  config: MediaBudgetConfig;
  passesBudget: boolean;
}

export const DEFAULT_MEDIA_BUDGETS: MediaBudgetConfig = {
  maxSingleFileBytes: 3 * 1024 * 1024, // 3.0 MB
  maxAggregateBytes: 10 * 1024 * 1024, // 10.0 MB
  mediaExtensions: [
    ".glb",
    ".gltf",
    ".obj",
    ".fbx",
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".avif",
    ".mp4",
    ".webm",
    ".ogv",
    ".mp3",
    ".wav",
    ".ogg",
  ],
  scanDirectories: ["public"],
};

/**
 * Scans workspace public media directories and evaluates payload budgets.
 */
export function inspectMediaBudgets(
  workspaceRoot: string = process.cwd(),
  customConfig?: Partial<MediaBudgetConfig>
): MediaBudgetReport {
  const config: MediaBudgetConfig = {
    ...DEFAULT_MEDIA_BUDGETS,
    ...customConfig,
  };

  const filesInfo: MediaFileInfo[] = [];
  const violations: string[] = [];
  let totalSizeBytes = 0;

  const findMediaFiles = (dirPath: string): void => {
    if (!fs.existsSync(dirPath)) return;

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        findMediaFiles(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (config.mediaExtensions.includes(ext)) {
          const stats = fs.statSync(fullPath);
          const sizeBytes = stats.size;
          const relativePath = path.relative(workspaceRoot, fullPath);

          filesInfo.push({
            relativePath,
            filename: entry.name,
            sizeBytes,
            extension: ext,
          });

          totalSizeBytes += sizeBytes;

          if (sizeBytes > config.maxSingleFileBytes) {
            const kb = (sizeBytes / 1024).toFixed(1);
            const maxKb = (config.maxSingleFileBytes / 1024).toFixed(0);
            violations.push(
              `Media file '${relativePath}' (${kb} kB) exceeds individual single-file budget of ${maxKb} kB.`
            );
          }
        }
      }
    }
  };

  for (const scanDir of config.scanDirectories) {
    const fullScanDir = path.join(workspaceRoot, scanDir);
    findMediaFiles(fullScanDir);
  }

  if (totalSizeBytes > config.maxAggregateBytes) {
    const mb = (totalSizeBytes / (1024 * 1024)).toFixed(2);
    const maxMb = (config.maxAggregateBytes / (1024 * 1024)).toFixed(1);
    violations.push(
      `Aggregate static media payload (${mb} MB across ${filesInfo.length} assets) exceeds aggregate media budget threshold of ${maxMb} MB.`
    );
  }

  filesInfo.sort((a, b) => b.sizeBytes - a.sizeBytes);

  return {
    scannedFilesCount: filesInfo.length,
    totalSizeBytes,
    files: filesInfo,
    violations,
    config,
    passesBudget: violations.length === 0,
  };
}

/**
 * Diagnostic check wrapper for DX Doctor system health reporting.
 */
export function checkMediaBudgets(workspaceRoot: string = process.cwd()): DiagnosticCheckResult {
  const report = inspectMediaBudgets(workspaceRoot);

  if (!report.passesBudget) {
    return {
      id: "quality-media-budgets",
      name: "Static Media Payload & Single-Asset Budget Engine",
      category: "quality",
      status: "fail",
      message: `${report.violations.length} static media asset budget violation(s) detected.`,
      details: report.violations,
    };
  }

  const totalMb = (report.totalSizeBytes / (1024 * 1024)).toFixed(2);
  return {
    id: "quality-media-budgets",
    name: "Static Media Payload & Single-Asset Budget Engine",
    category: "quality",
    status: "pass",
    message: `All ${report.scannedFilesCount} static media assets comply with budget thresholds (Total: ${totalMb} MB).`,
  };
}

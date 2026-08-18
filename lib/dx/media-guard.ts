import fs from "fs";
import path from "path";
import type { DiagnosticCheckResult } from "./doctor";

export interface MediaFileInfo {
  name: string;
  relativePath: string;
  sizeBytes: number;
  extension: string;
  category: "image" | "3d" | "audio" | "video" | "archive" | "other";
}

export interface MediaBudgetConfig {
  maxSingleFileBytes?: number;
  maxAggregateBytes?: number;
  publicDirName?: string;
}

export interface MediaBudgetReport {
  totalFiles: number;
  totalBytes: number;
  maxSingleFileBytes: number;
  maxAggregateBytes: number;
  files: MediaFileInfo[];
  violations: string[];
}

export const DEFAULT_MEDIA_BUDGETS: Required<Omit<MediaBudgetConfig, "publicDirName">> = {
  maxSingleFileBytes: 6 * 1024 * 1024, // 6 MB max single file threshold
  maxAggregateBytes: 25 * 1024 * 1024, // 25 MB max aggregate threshold
};

const MEDIA_EXTENSIONS: Record<string, MediaFileInfo["category"]> = {
  // Images
  ".jpg": "image",
  ".jpeg": "image",
  ".png": "image",
  ".gif": "image",
  ".webp": "image",
  ".avif": "image",
  ".svg": "image",
  ".ico": "image",
  // 3D Models
  ".glb": "3d",
  ".gltf": "3d",
  ".obj": "3d",
  ".fbx": "3d",
  ".usdz": "3d",
  ".stl": "3d",
  // Audio
  ".mp3": "audio",
  ".wav": "audio",
  ".ogg": "audio",
  ".aac": "audio",
  ".flac": "audio",
  ".m4a": "audio",
  // Video
  ".mp4": "video",
  ".webm": "video",
  ".ogv": "video",
  ".mov": "video",
  ".avi": "video",
  // Design & Archives
  ".zip": "archive",
  ".psd": "archive",
  ".ai": "archive",
  ".eps": "archive",
  ".pdf": "archive",
};

/**
  Recursively scan directory for media files
 */
function findMediaFiles(dir: string, baseDir: string): MediaFileInfo[] {
  if (!fs.existsSync(dir)) return [];
  const results: MediaFileInfo[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findMediaFiles(fullPath, baseDir));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (ext in MEDIA_EXTENSIONS) {
        const stats = fs.statSync(fullPath);
        results.push({
          name: entry.name,
          relativePath: path.relative(baseDir, fullPath).replace(/\\/g, "/"),
          sizeBytes: stats.size,
          extension: ext,
          category: MEDIA_EXTENSIONS[ext],
        });
      }
    }
  }

  return results;
}

/**
 * Inspects static media files in public/ and evaluates payload sizes against defined budgets.
 */
export function inspectMediaBudgets(
  workspaceRoot: string,
  config: MediaBudgetConfig = {}
): MediaBudgetReport {
  const publicDirName = config.publicDirName || "public";
  const publicDir = path.join(workspaceRoot, publicDirName);
  const maxSingleFileBytes = config.maxSingleFileBytes ?? DEFAULT_MEDIA_BUDGETS.maxSingleFileBytes;
  const maxAggregateBytes = config.maxAggregateBytes ?? DEFAULT_MEDIA_BUDGETS.maxAggregateBytes;

  if (!fs.existsSync(publicDir)) {
    return {
      totalFiles: 0,
      totalBytes: 0,
      maxSingleFileBytes,
      maxAggregateBytes,
      files: [],
      violations: [],
    };
  }

  const files = findMediaFiles(publicDir, workspaceRoot);
  const violations: string[] = [];
  let totalBytes = 0;

  for (const file of files) {
    totalBytes += file.sizeBytes;
    if (file.sizeBytes > maxSingleFileBytes) {
      const sizeMb = (file.sizeBytes / (1024 * 1024)).toFixed(2);
      const limitMb = (maxSingleFileBytes / (1024 * 1024)).toFixed(2);
      violations.push(
        `Media asset '${file.relativePath}' (${sizeMb} MB) exceeds maximum single-file budget of ${limitMb} MB.`
      );
    }
  }

  if (totalBytes > maxAggregateBytes) {
    const totalMb = (totalBytes / (1024 * 1024)).toFixed(2);
    const limitMb = (maxAggregateBytes / (1024 * 1024)).toFixed(2);
    violations.push(
      `Aggregate static media payload size (${totalMb} MB) exceeds maximum aggregate budget of ${limitMb} MB.`
    );
  }

  files.sort((a, b) => b.sizeBytes - a.sizeBytes);

  return {
    totalFiles: files.length,
    totalBytes,
    maxSingleFileBytes,
    maxAggregateBytes,
    files,
    violations,
  };
}

/**
 * Diagnostic check for media asset budgets in doctor.ts.
 */
export function checkMediaBudgets(
  root: string,
  config?: MediaBudgetConfig
): DiagnosticCheckResult {
  const report = inspectMediaBudgets(root, config);

  if (report.violations.length > 0) {
    return {
      id: "media-performance-budgets",
      name: "Static Media Asset Performance Budgets",
      category: "quality",
      status: "fail",
      message: `${report.violations.length} static media file(s) breached defined performance budgets.`,
      details: report.violations,
      fixable: false,
    };
  }

  const totalMb = (report.totalBytes / (1024 * 1024)).toFixed(2);
  return {
    id: "media-performance-budgets",
    name: "Static Media Asset Performance Budgets",
    category: "quality",
    status: "pass",
    message: `All ${report.totalFiles} static media files comply with performance budgets (Total: ${totalMb} MB).`,
  };
}

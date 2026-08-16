import fs from "fs";
import path from "path";
import type { DiagnosticCheckResult } from "./doctor";

export interface ExportItem {
  name: string;
  kind: "function" | "const" | "type" | "interface" | "class" | "enum" | "default";
  filePath: string;
  line: number;
}

export interface DeadCodeReport {
  totalScannedFiles: number;
  totalExports: number;
  unusedExports: ExportItem[];
  orphanedFiles: string[];
}

function findSourceFiles(dir: string, extensions: string[] = [".ts", ".tsx"]): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!["node_modules", ".git", ".next", "dist", "coverage", ".agents", "scratch", "tmp"].includes(entry.name)) {
        results.push(...findSourceFiles(fullPath, extensions));
      }
    } else if (extensions.includes(path.extname(entry.name)) && !entry.name.endsWith(".d.ts")) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Checks if a file is an entrypoint by framework convention.
 */
function isConventionEntrypoint(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, "/");
  const base = path.basename(normalized);

  // Next.js App Router convention files
  if (
    [
      "page.tsx",
      "layout.tsx",
      "route.ts",
      "loading.tsx",
      "error.tsx",
      "not-found.tsx",
      "sitemap.ts",
      "robots.ts",
      "instrumentation.ts",
      "middleware.ts",
      "global-error.tsx",
      "template.tsx",
      "default.tsx",
    ].includes(base)
  ) {
    return true;
  }

  // Scripts, configs, tests, seeds
  if (
    normalized.includes("/scripts/") ||
    normalized.includes("/__tests__/") ||
    normalized.includes("/prisma/") ||
    base.includes(".config.") ||
    base.startsWith("sentry.")
  ) {
    return true;
  }

  return false;
}

/**
 * Extract exported symbols from TypeScript/TSX code using regex parsing.
 */
export function extractExports(filePath: string, content: string): ExportItem[] {
  const exports: ExportItem[] = [];
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineNum = i + 1;

    // Skip comments
    if (line.startsWith("//") || line.startsWith("/*") || line.startsWith("*")) continue;

    // Default export
    if (/^export\s+default\s+/.test(line)) {
      exports.push({ name: "default", kind: "default", filePath, line: lineNum });
      continue;
    }

    // Named function
    const funcMatch = line.match(/^export\s+(?:async\s+)?function\s+([A-Za-z0-9_$]+)/);
    if (funcMatch) {
      exports.push({ name: funcMatch[1], kind: "function", filePath, line: lineNum });
      continue;
    }

    // Named const/let/var
    const constMatch = line.match(/^export\s+const\s+([A-Za-z0-9_$]+)/);
    if (constMatch) {
      exports.push({ name: constMatch[1], kind: "const", filePath, line: lineNum });
      continue;
    }

    // Named type
    const typeMatch = line.match(/^export\s+type\s+([A-Za-z0-9_$]+)/);
    if (typeMatch) {
      exports.push({ name: typeMatch[1], kind: "type", filePath, line: lineNum });
      continue;
    }

    // Named interface
    const ifaceMatch = line.match(/^export\s+interface\s+([A-Za-z0-9_$]+)/);
    if (ifaceMatch) {
      exports.push({ name: ifaceMatch[1], kind: "interface", filePath, line: lineNum });
      continue;
    }

    // Named class
    const classMatch = line.match(/^export\s+(?:abstract\s+)?class\s+([A-Za-z0-9_$]+)/);
    if (classMatch) {
      exports.push({ name: classMatch[1], kind: "class", filePath, line: lineNum });
      continue;
    }

    // Named enum
    const enumMatch = line.match(/^export\s+enum\s+([A-Za-z0-9_$]+)/);
    if (enumMatch) {
      exports.push({ name: enumMatch[1], kind: "enum", filePath, line: lineNum });
      continue;
    }
  }

  return exports;
}

/**
 * Scans the workspace for dead code and unreferenced exports.
 */
export function scanDeadCode(workspaceRoot: string): DeadCodeReport {
  const scanDirs = ["app", "components", "lib", "hooks", "types", "scripts", "__tests__"];
  const allSourceFiles: string[] = [];

  for (const dir of scanDirs) {
    const fullDir = path.join(workspaceRoot, dir);
    allSourceFiles.push(...findSourceFiles(fullDir));
  }

  // Load all file contents into memory for fast matching
  const fileContents = new Map<string, string>();
  for (const f of allSourceFiles) {
    fileContents.set(f, fs.readFileSync(f, "utf-8"));
  }

  const allExports: ExportItem[] = [];
  const targetFilesToAnalyze = allSourceFiles.filter((f) => !isConventionEntrypoint(f));

  for (const f of targetFilesToAnalyze) {
    const content = fileContents.get(f) || "";
    const fileExports = extractExports(f, content);
    allExports.push(...fileExports);
  }

  const unusedExports: ExportItem[] = [];

  for (const exp of allExports) {
    // If default export on a non-entrypoint file, check if filename or import references it
    if (exp.name === "default") {
      const baseName = path.basename(exp.filePath).replace(/\.[^/.]+$/, "");
      let referenced = false;
      for (const [f, content] of fileContents.entries()) {
        if (f === exp.filePath) continue;
        if (content.includes(baseName) || content.includes(path.basename(exp.filePath))) {
          referenced = true;
          break;
        }
      }
      if (!referenced) {
        unusedExports.push(exp);
      }
      continue;
    }

    // Check if exp.name is referenced in any other file
    let referenced = false;
    const nameRegex = new RegExp(`\\b${exp.name}\\b`);

    for (const [f, content] of fileContents.entries()) {
      if (f === exp.filePath) {
        continue;
      }
      if (content.includes(exp.name) && nameRegex.test(content)) {
        referenced = true;
        break;
      }
    }

    if (!referenced) {
      unusedExports.push(exp);
    }
  }

  return {
    totalScannedFiles: allSourceFiles.length,
    totalExports: allExports.length,
    unusedExports,
    orphanedFiles: [],
  };
}

/**
 * Diagnostic check for Dead Code & Unused Exports in doctor.ts.
 */
export function checkDeadCode(root: string): DiagnosticCheckResult {
  const report = scanDeadCode(root);

  if (report.unusedExports.length > 0) {
    // Only warn if there are unused exports so it doesn't break CI unexpectedly
    const details = report.unusedExports.slice(0, 10).map((u) => {
      const relPath = path.relative(root, u.filePath);
      return `${relPath}:${u.line} - [${u.kind}] ${u.name}`;
    });

    if (report.unusedExports.length > 10) {
      details.push(`... and ${report.unusedExports.length - 10} more`);
    }

    return {
      id: "dead-code-scanner",
      name: "Dead Code & Unused Export Scanner",
      category: "quality",
      status: "warn",
      message: `Found ${report.unusedExports.length} potentially unused export(s) across ${report.totalScannedFiles} source files.`,
      details,
    };
  }

  return {
    id: "dead-code-scanner",
    name: "Dead Code & Unused Export Scanner",
    category: "quality",
    status: "pass",
    message: `All ${report.totalExports} analyzed exports across ${report.totalScannedFiles} files are active and referenced.`,
  };
}

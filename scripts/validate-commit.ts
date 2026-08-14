import { execSync } from "child_process";
import path from "path";
import { scanFile } from "../lib/validation-scanner";

function getStagedFiles(): string[] {
  try {
    const output = execSync("git diff --cached --name-only --diff-filter=d", { encoding: "utf-8" });
    return output
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);
  } catch (error) {
    console.error("Error executing git command:", error);
    return [];
  }
}

export function shouldScanFile(filePath: string): boolean {
  // Exclude node_modules, package locks, binary files, configurations that are meant to hold env configs, etc.
  const ignoredExtensions = [
    ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".woff", ".woff2", ".ttf", ".eot",
    ".db", ".zip", ".tar", ".gz", ".pdf", ".mp4", ".mov"
  ];
  const ignoredFiles = ["package-lock.json", "bun.lock", "yarn.lock", "pnpm-lock.yaml"];
  const ignoredDirectories = ["node_modules/", ".git/", ".next/", "dist/", "build/", "__tests__/"];

  const baseName = path.basename(filePath);
  const ext = path.extname(filePath).toLowerCase();

  if (ignoredExtensions.includes(ext) || ignoredFiles.includes(baseName)) {
    return false;
  }

  for (const dir of ignoredDirectories) {
    if (filePath.startsWith(dir) || filePath.includes("/" + dir)) {
      return false;
    }
  }

  return true;
}

function main() {
  const startTime = Date.now();
  console.log("Starting Pre-Commit Regex Guards validation...");

  const stagedFiles = getStagedFiles();
  let hasViolation = false;

  for (const file of stagedFiles) {
    if (!shouldScanFile(file)) {
      continue;
    }

    const absolutePath = path.resolve(process.cwd(), file);
    const matches = scanFile(absolutePath);

    if (matches.length > 0) {
      hasViolation = true;
      console.error(`\n❌ [SECURITY ALERT] Sensitive information or credential pattern detected in staged file: ${file}`);
      for (const match of matches) {
        console.error(
          `  - Line ${match.lineNumber}: Category [${match.category}]`
        );
        console.error(`    Matched Text: "${match.matchedText}"`);
        console.error(`    Line Content: "${match.lineContent}"`);
      }
    }
  }

  const duration = Date.now() - startTime;
  console.log(`Pre-Commit validation completed in ${duration}ms.`);

  if (hasViolation) {
    console.error("\n❌ Commit blocked. Please sanitize all highlighted credentials before committing.\n");
    process.exit(1);
  } else {
    console.log("✅ Pre-Commit validation passed. No credential patterns detected.");
    process.exit(0);
  }
}

if (typeof process.env.VITEST === "undefined") {
  main();
}

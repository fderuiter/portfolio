import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import { scanFile } from "../lib/validation-scanner";

// Map of files that are statically read (e.g. via readFileSync) in tests
const staticDependencyMap: Record<string, string[]> = {
  "components/SandboxTerminal.tsx": ["__tests__/sandbox-terminal.test.tsx", "__tests__/audio-synthesizer.test.tsx"],
  "components/RichNarrative.tsx": ["__tests__/terminology-tooltips.test.tsx", "__tests__/integrity.test.ts"],
  "components/TerminologyToggle.tsx": ["__tests__/terminology-tooltips.test.tsx"],
  "components/ui/Tooltip.tsx": ["__tests__/terminology-tooltips.test.tsx"],
  "hooks/usePretextLayout.tsx": ["__tests__/transparent-text-overlay.test.ts"],
  "components/PretextCard.tsx": ["__tests__/transparent-text-overlay.test.ts"],
  "components/Hero.tsx": ["__tests__/transparent-text-overlay.test.ts"],
  "app/proof/page.tsx": ["__tests__/proof-simulation.test.ts"],
  "components/providers/AudioProvider.tsx": ["__tests__/audio-synthesizer.test.tsx"],
  "components/Navbar.tsx": ["__tests__/audio-synthesizer.test.tsx"],
  "components/SkillsGrid.tsx": ["__tests__/audio-synthesizer.test.tsx"],
  "components/RetroLabyrinth.tsx": ["__tests__/retro-labyrinth.test.tsx"],
  "prisma/schema.prisma": ["__tests__/integrity.test.ts"],
  "CMS_GUIDELINES.md": ["__tests__/integrity.test.ts"],
  "types/domain.ts": ["__tests__/integrity.test.ts"]
};

function getStagedFiles(): string[] {
  try {
    const output = execSync("git diff --cached --name-only --diff-filter=d", { encoding: "utf-8" });
    return output
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);
  } catch (error) {
    console.error("\x1b[31mError executing git diff command:\x1b[0m", error);
    return [];
  }
}

function shouldScanFile(filePath: string): boolean {
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

function runCommand(command: string): void {
  try {
    execSync(command, { stdio: "inherit" });
  } catch (error) {
    throw new Error(`Command failed: ${command}`);
  }
}

function main() {
  const startTime = Date.now();
  console.log("\x1b[1m\x1b[36m🚀 Starting Focused Staged Validation Pipeline...\x1b[0m\n");

  const stagedFiles = getStagedFiles();
  
  if (stagedFiles.length === 0) {
    console.log("\x1b[32mNo staged changes detected. Skipping pre-commit validation.\x1b[0m");
    process.exit(0);
  }

  console.log(`Found ${stagedFiles.length} staged file(s) to process.`);

  // ==========================================
  // PHASE 1: Security credential scans (Regex Guards)
  // ==========================================
  console.log("\n\x1b[1m\x1b[34m🔍 [Phase 1/4] Scanning staged files for sensitive patterns...\x1b[0m");
  let hasViolation = false;

  for (const file of stagedFiles) {
    if (!shouldScanFile(file)) {
      continue;
    }

    const absolutePath = path.resolve(process.cwd(), file);
    if (!fs.existsSync(absolutePath)) {
      continue;
    }
    const matches = scanFile(absolutePath);

    if (matches.length > 0) {
      hasViolation = true;
      console.error(`\n\x1b[31m❌ [SECURITY ALERT] Sensitive information or credential pattern detected in staged file: ${file}\x1b[0m`);
      for (const match of matches) {
        console.error(`  - Line ${match.lineNumber}: Category [${match.category}]`);
        console.error(`    Matched Text: "${match.matchedText}"`);
        console.error(`    Line Content: "${match.lineContent}"`);
      }
    }
  }

  if (hasViolation) {
    console.error("\n\x1b[31m❌ Commit blocked. Please sanitize all highlighted credentials before committing.\n\x1b[0m");
    process.exit(1);
  }
  console.log("\x1b[32m✅ Security scan passed. No credential patterns detected.\x1b[0m");

  // ==========================================
  // File Categorization for targeted workflows
  // ==========================================
  const codeFiles: string[] = [];
  const stagedTestFiles: string[] = [];
  const markdownFiles: string[] = [];

  for (const file of stagedFiles) {
    const isTest = file.includes("__tests__/") || 
                   /\.test\.[jt]sx?$/.test(file) || 
                   /\.spec\.[jt]sx?$/.test(file);
    const ext = path.extname(file).toLowerCase();

    if (isTest) {
      stagedTestFiles.push(file);
    } else if ([".ts", ".tsx", ".js", ".jsx", ".mts", ".mjs"].includes(ext)) {
      // Exclude ignored dirs for code files
      const isIgnoredDir = ["node_modules/", ".git/", ".next/", "dist/", "build/"].some(
        dir => file.startsWith(dir) || file.includes("/" + dir)
      );
      if (!isIgnoredDir) {
        codeFiles.push(file);
      }
    } else if (ext === ".md") {
      markdownFiles.push(file);
    }
  }

  const hasCodeOrTestChanges = codeFiles.length > 0 || stagedTestFiles.length > 0;

  // If there are no code or test changes (only non-code modifications like markdown or other assets)
  if (!hasCodeOrTestChanges) {
    console.log("\n\x1b[33mℹ️ Non-code modifications detected (no code/test files changed).\x1b[0m");
    console.log("\x1b[33m   Skipping TypeScript compilation, ESLint, and Vitest test suite.\x1b[0m");

    // We can still lint the markdown files if any are staged
    if (markdownFiles.length > 0) {
      console.log("\n\x1b[1m\x1b[34m🔍 [Phase 2/4] Linting staged markdown files...\x1b[0m");
      try {
        runCommand(`npx markdownlint ${markdownFiles.join(" ")}`);
        console.log("\x1b[32m✅ Markdown linting passed.\x1b[0m");
      } catch (err) {
        console.error("\n\x1b[31m❌ Markdown linting failed. Please fix warnings before committing.\x1b[0m");
        process.exit(1);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`\n\x1b[1m\x1b[32m✅ Pre-Commit validation completed successfully in ${duration}ms.\x1b[0m`);
    process.exit(0);
  }

  // ==========================================
  // PHASE 2: Code & Document Linting
  // ==========================================
  console.log("\n\x1b[1m\x1b[34m🔍 [Phase 2/4] Running code and document linting...\x1b[0m");
  try {
    if (codeFiles.length > 0) {
      console.log(`Linting ${codeFiles.length} staged code file(s) with ESLint...`);
      runCommand(`npx eslint --no-warn-ignored --fix ${codeFiles.join(" ")}`);
    }
    if (markdownFiles.length > 0) {
      console.log(`Linting ${markdownFiles.length} staged markdown file(s) with markdownlint...`);
      runCommand(`npx markdownlint ${markdownFiles.join(" ")}`);
    }
    console.log("\x1b[32m✅ Linting checks passed.\x1b[0m");
  } catch (err) {
    console.error("\n\x1b[31m❌ Linting verification failed. Please fix issues before committing.\x1b[0m");
    process.exit(1);
  }

  // ==========================================
  // PHASE 3: Targeted TypeScript Type-checking
  // ==========================================
  const tsFiles = codeFiles.filter(f => /\.[m]?tsx?$/.test(f));
  if (tsFiles.length > 0) {
    console.log("\n\x1b[1m\x1b[34m🔍 [Phase 3/4] Performing targeted TypeScript type-checking...\x1b[0m");
    console.log(`Typechecking ${tsFiles.length} staged TS/TSX file(s) and their dependents...`);

    const tempTsconfigPath = path.resolve(process.cwd(), "tsconfig-staged.json");
    const tempConfig = {
      extends: "./tsconfig.json",
      include: [
        "types/env.d.ts",
        "types/domain.ts",
        ...tsFiles
      ]
    };

    try {
      fs.writeFileSync(tempTsconfigPath, JSON.stringify(tempConfig, null, 2), "utf-8");
      runCommand(`npx tsc --noEmit --project tsconfig-staged.json`);
      console.log("\x1b[32m-- Targeted type-checking passed.\x1b[0m");
    } catch (err) {
      console.error("\n\x1b[31m❌ TypeScript type-checking failed. Please fix type errors before committing.\x1b[0m");
      process.exit(1);
    } finally {
      if (fs.existsSync(tempTsconfigPath)) {
        fs.unlinkSync(tempTsconfigPath);
      }
    }
  } else {
    console.log("\n\x1b[33m🔍 [Phase 3/4] No staged TS/TSX files. Skipping type-checking.\x1b[0m");
  }

  // ==========================================
  // PHASE 4: Targeted Testing (Vitest related)
  // ==========================================
  console.log("\n\x1b[1m\x1b[34m🔍 [Phase 4/4] Executing targeted tests...\x1b[0m");

  const testInputs = new Set<string>();

  // 1. Add all staged test files
  for (const file of stagedTestFiles) {
    testInputs.add(file);
  }

  // 2. Add static mapping dependencies
  for (const file of stagedFiles) {
    if (staticDependencyMap[file]) {
      for (const mappedTest of staticDependencyMap[file]) {
        testInputs.add(mappedTest);
      }
    }
  }

  // 3. If markdown files are staged, add integrity test since it scans all .md files
  if (markdownFiles.length > 0) {
    testInputs.add("__tests__/integrity.test.ts");
  }

  // 4. Add other staged code files themselves as related inputs
  for (const file of codeFiles) {
    testInputs.add(file);
  }

  if (testInputs.size > 0) {
    const filesToPass = Array.from(testInputs);
    console.log(`Running related tests for: ${filesToPass.join(", ")}`);
    try {
      // Execute vitest related directly, skipping pretest code/asset regeneration!
      runCommand(`npx vitest related ${filesToPass.join(" ")} --run`);
      console.log("\x1b[32m✅ Related tests passed successfully.\x1b[0m");
    } catch (err) {
      console.error("\n\x1b[31m❌ Test execution failed. Please fix failing tests before committing.\x1b[0m");
      process.exit(1);
    }
  } else {
    console.log("\x1b[32m✅ No related tests found. Skipping test execution.\x1b[0m");
  }

  const duration = Date.now() - startTime;
  console.log(`\n\x1b[1m\x1b[32m✅ Pre-Commit validation completed successfully in ${duration}ms.\x1b[0m`);
  process.exit(0);
}

main();

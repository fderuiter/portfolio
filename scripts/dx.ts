#!/usr/bin/env node
/**
 * Developer Experience (DX) Suite & Invariant CLI
 * Zero-dependency TypeScript task runner and architecture guard
 */

import readline from "readline";
import path from "path";
import fs from "fs";
import { execSync, execFileSync } from "child_process";
import { runDiagnostics, printDoctorReport } from "../lib/dx/doctor";
import { scaffold, type ScaffoldType, validateScaffoldType, validateScaffoldName } from "../lib/dx/scaffolder";
import { runAllBenchmarks, printBenchmarkReport } from "../lib/dx/bench";
import { colors, formatHeader, badge, formatSection } from "../lib/dx/utils";
import { ALLOWED_COMMIT_TYPES, validateCommitMessage, validateBranchName } from "../lib/dx/git-guard";
import { checkEnvironmentVariables } from "../lib/dx/env-guard";
import { runSetupWorkflow } from "../lib/dx/setup";
import { scanDeadCode } from "../lib/dx/dead-code";
import { inspectBundleChunks, DEFAULT_BUDGETS } from "../lib/dx/bundle-guard";

const workspaceRoot = path.resolve(__dirname, "..");

function printUsage(): void {
  console.log(formatHeader("Developer Experience (DX) Suite & Invariant Engine", "Next.js 16 • React 19 • Pretext Layout Engine"));
  console.log(`${colors.bold}Usage:${colors.reset} dx <command> [options]\n`);
  console.log(`${colors.bold}Commands:${colors.reset}`);
  console.log(`  ${colors.cyan}setup${colors.reset}                  Interactive developer onboarding & environment setup`);
  console.log(`  ${colors.cyan}doctor${colors.reset}                 Run architectural & invariant health diagnostics`);
  console.log(`  ${colors.cyan}doctor --fix${colors.reset}           Run diagnostics and automatically fix remediable issues`);
  console.log(`  ${colors.cyan}verify${colors.reset}                 Strict invariant check for CI / pre-commit (exits with code 1 on failure)`);
  console.log(`  ${colors.cyan}commit${colors.reset}                 Interactive Conventional Commit wizard`);
  console.log(`  ${colors.cyan}branch${colors.reset}                 Interactive branch generator with convention validation`);
  console.log(`  ${colors.cyan}env${colors.reset}                    Validate runtime environment schema & sync .env.example`);
  console.log(`  ${colors.cyan}dead-code${colors.reset}              Scan for unused exports and orphaned modules`);
  console.log(`  ${colors.cyan}analyze [--strict]${colors.reset}     Inspect production bundle chunk sizes and performance budgets`);
  console.log(`  ${colors.cyan}scaffold <type> <name>${colors.reset} Scaffold code templates (types: arcade, api, adr, case-study, component, hook)`);
  console.log(`  ${colors.cyan}build:icons${colors.reset}            Generate multi-resolution brand icons from source vector artwork`);
  console.log(`  ${colors.cyan}build:theme${colors.reset}            Compile CSS custom properties into strongly-typed TS design manifest`);
  console.log(`  ${colors.cyan}bench${colors.reset}                  Run Pretext, Masonry Scheduler, and Security benchmarks`);
  console.log(`  ${colors.cyan}bench --pages${colors.reset}          Run real-browser Core Web Vitals & page speed benchmarks`);
  console.log(`  ${colors.cyan}clean${colors.reset}                  Clean build artifacts and reset developer cache`);
  console.log(`  ${colors.cyan}crf <cmd> [options]${colors.reset}    Clinical Research Form (CRF) authoring & CDISC validation CLI`);
  console.log(`  ${colors.cyan}help${colors.reset}                   Show this help menu\n`);
  console.log(`${colors.bold}Examples:${colors.reset}`);
  console.log(`  $ npm run dx doctor`);
  console.log(`  $ npm run dx doctor -- --fix`);
  console.log(`  $ npm run dx commit`);
  console.log(`  $ npm run dx env`);
  console.log(`  $ npm run dx dead-code`);
  console.log(`  $ npm run dx analyze`);
  console.log(`  $ npm run dx scaffold arcade matrix-defender`);
  console.log(`  $ npm run dx bench\n`);
}

async function handleSetupCommand(args: string[]): Promise<void> {
  const isYes = args.includes("--yes") || args.includes("-y");
  const skipDb = args.includes("--skip-db");
  const skipDbSeed = args.includes("--skip-db-seed");
  const forceEnv = args.includes("--force-env");

  const result = await runSetupWorkflow({
    workspaceRoot,
    interactive: !isYes,
    skipDb,
    skipDbSeed,
    forceEnv,
  });

  if (!result.success) {
    process.exit(1);
  }
}

async function handleDoctorCommand(args: string[]): Promise<void> {
  const fix = args.includes("--fix");
  const ci = args.includes("--ci");

  console.log(formatHeader("DX Doctor: Architectural & Invariant Diagnostics"));
  if (fix) {
    console.log(`${colors.magenta}⚙ Mode: Auto-Remediation Enabled (--fix)${colors.reset}\n`);
  }

  const startTime = Date.now();
  const summary = await runDiagnostics({ workspaceRoot, fix, ci });
  printDoctorReport(summary, ci);
  const elapsed = Date.now() - startTime;
  console.log(`\nDiagnostics finished in ${elapsed}ms.`);

  if (summary.hasFailures) {
    process.exit(1);
  }
}

async function handleVerifyCommand(): Promise<void> {
  console.log(formatHeader("DX Verify: Fast Pre-Commit & CI Guard"));
  const summary = await runDiagnostics({ workspaceRoot, fix: false, ci: true });
  printDoctorReport(summary, true);

  if (summary.hasFailures) {
    console.error(`\n${colors.brightRed}❌ Invariant verification failed. Resolve highlighted issues or run 'npm run doctor:fix'.${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`\n${colors.brightGreen}✅ All AGENTS.md architectural invariants and security checks verified.${colors.reset}\n`);
    process.exit(0);
  }
}

async function handleEnvCommand(args: string[] = []): Promise<void> {
  const fix = args.includes("--fix");
  console.log(formatHeader("DX Environment & Schema Sentinel", "lib/env.ts • .env.example"));

  const result = checkEnvironmentVariables(workspaceRoot, fix);
  console.log(badge(`[${result.category.toUpperCase()}] ${result.name}`, result.status));
  console.log(`  ${result.message}`);

  if (result.details && result.details.length > 0) {
    console.log("\nDetails:");
    for (const d of result.details) {
      console.log(`  ${colors.yellow}• ${d}${colors.reset}`);
    }
  }

  if (result.status === "fail" && !fix) {
    console.log(`\n${colors.cyan}Tip: Run 'npm run dx env -- --fix' to auto-sync .env.example.${colors.reset}\n`);
    process.exit(1);
  }
}

function handleDeadCodeCommand(): void {
  console.log(formatHeader("DX Dead Code & Unused Export Scanner", "Static AST & Cross-Workspace Reference Analyzer"));

  const report = scanDeadCode(workspaceRoot);
  console.log(`Scanned ${colors.cyan}${report.totalScannedFiles}${colors.reset} files | Found ${colors.cyan}${report.totalExports}${colors.reset} exports.\n`);

  if (report.unusedExports.length === 0) {
    console.log(`${colors.brightGreen}✔ No unused exports or orphaned files detected. Codebase is clean!${colors.reset}\n`);
    return;
  }

  console.log(`${colors.yellow}Found ${report.unusedExports.length} potentially unused export(s):${colors.reset}\n`);
  for (const u of report.unusedExports) {
    const relPath = path.relative(workspaceRoot, u.filePath);
    console.log(`  ${colors.dim}${relPath}:${u.line}${colors.reset}  ${colors.cyan}[${u.kind}]${colors.reset} ${colors.bold}${u.name}${colors.reset}`);
  }
  console.log("");
}

export function handleAnalyzeCommand(args: string[] = []): void {
  const strict = args.includes("--strict") || args.includes("strict");
  console.log(formatHeader("DX Bundle Analyzer & Chunk Budget Guard", ".next/static/chunks • Gzip Size Assertions"));
  if (strict) {
    console.log(`${colors.magenta}⚙ Mode: Strict Enforcement (--strict)${colors.reset}\n`);
  }

  const report = inspectBundleChunks(workspaceRoot);

  if (!report.isBuilt) {
    console.log(`${colors.yellow}No build artifacts detected in .next/static/chunks/. Run 'npm run build' first.${colors.reset}\n`);
    if (strict) {
      process.exit(1);
    }
    return;
  }

  console.log(formatSection("Production Chunk Inventory"));
  console.log(
    `Total Chunks: ${colors.cyan}${report.totalChunks}${colors.reset} | ` +
    `Total Raw: ${colors.cyan}${(report.totalRawBytes / 1024).toFixed(1)} kB${colors.reset} | ` +
    `Total Gzip: ${colors.cyan}${(report.totalGzipBytes / 1024).toFixed(1)} kB${colors.reset} | ` +
    `Initial Shared Gzip: ${colors.cyan}${(report.initialSharedGzipBytes / 1024).toFixed(1)} kB${colors.reset} (Budget: ${(DEFAULT_BUDGETS.maxInitialSharedGzip / 1024).toFixed(0)} kB)\n`
  );

  console.log(`${colors.bold}${"CHUNK NAME".padEnd(45)} ${"RAW (kB)".padStart(12)} ${"GZIP (kB)".padStart(12)} ${"INITIAL".padStart(10)}${colors.reset}`);
  console.log("─".repeat(82));

  for (const chunk of report.chunks.slice(0, 15)) {
    const name = chunk.name.length > 43 ? chunk.name.slice(0, 40) + "..." : chunk.name;
    const rawKb = (chunk.rawBytes / 1024).toFixed(1);
    const gzipKb = (chunk.gzipBytes / 1024).toFixed(1);
    const initBadge = chunk.isInitial ? `${colors.magenta}YES${colors.reset}` : `${colors.gray}NO${colors.reset}`;

    console.log(`${name.padEnd(45)} ${rawKb.padStart(12)} ${gzipKb.padStart(12)} ${initBadge.padStart(19)}`);
  }

  if (report.chunks.length > 15) {
    console.log(`... and ${report.chunks.length - 15} more chunks.`);
  }

  if (report.violations.length > 0) {
    console.log(`\n${colors.brightRed}❌ Performance Budget Violations:${colors.reset}`);
    for (const v of report.violations) {
      console.log(`  ${colors.red}• ${v}${colors.reset}`);
    }
    console.log("");
    if (strict) {
      process.exit(1);
    }
  } else {
    console.log(`\n${colors.brightGreen}✔ All chunks comply with production performance budgets.${colors.reset}\n`);
  }
}

export async function handleCommitCommand(): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log(formatHeader("DX Conventional Commit Wizard"));
  console.log(`Select commit type from allowed list:`);
  console.log(`  ${colors.cyan}${ALLOWED_COMMIT_TYPES.join(", ")}${colors.reset}\n`);

  const question = (q: string): Promise<string> =>
    new Promise((resolve) => rl.question(q, (ans) => resolve(ans.trim())));

  const type = await question(`${colors.bold}Type${colors.reset} (e.g. feat, fix, dx, docs): `);
  const scope = await question(`${colors.bold}Scope${colors.reset} [optional, e.g. proof, crf, a11y]: `);
  const subject = await question(`${colors.bold}Subject (lowercase, imperative)${colors.reset}: `);
  const isBreakingStr = await question(`${colors.bold}Is breaking change? (y/N)${colors.reset}: `);

  rl.close();

  const isBreaking = isBreakingStr.toLowerCase() === "y";
  const exclamation = isBreaking ? "!" : "";
  const header = scope ? `${type}(${scope})${exclamation}: ${subject}` : `${type}${exclamation}: ${subject}`;

  const validation = validateCommitMessage(header);
  if (!validation.valid) {
    console.error(`\n${colors.brightRed}❌ Generated commit message failed validation:${colors.reset}`);
    for (const err of validation.errors) {
      console.error(`  ${colors.red}• ${err}${colors.reset}`);
    }
    console.log("");
    process.exit(1);
  }

  console.log(`\n${colors.brightGreen}Commit Message:${colors.reset} ${colors.bold}${header}${colors.reset}`);
  try {
    execFileSync("git", ["commit", "-m", header], { stdio: "inherit" });
    console.log(`\n${colors.brightGreen}✔ Commit created successfully.${colors.reset}\n`);
  } catch {
    console.error(`\n${colors.red}Git commit command failed.${colors.reset}\n`);
  }
}

async function handleBranchCommand(): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log(formatHeader("DX Git Branch Generator"));
  console.log(`Allowed prefixes: ${colors.cyan}feat/, fix/, chore/, refactor/, docs/, perf/, dx/, test/${colors.reset}\n`);

  const question = (q: string): Promise<string> =>
    new Promise((resolve) => rl.question(q, (ans) => resolve(ans.trim())));

  const prefix = await question(`${colors.bold}Prefix${colors.reset} (e.g. feat, fix, dx): `);
  const slug = await question(`${colors.bold}Branch slug${colors.reset} (e.g. add-telemetry-guard): `);
  rl.close();

  const cleanPrefix = prefix.endsWith("/") ? prefix : `${prefix}/`;
  const branchName = `${cleanPrefix}${slug}`.toLowerCase().replace(/\s+/g, "-");

  const validation = validateBranchName(branchName);
  if (!validation.valid) {
    console.error(`\n${colors.brightRed}❌ Invalid branch name:${colors.reset} ${validation.error}\n`);
    process.exit(1);
  }

  console.log(`\nCreating branch: ${colors.cyan}${branchName}${colors.reset}`);
  try {
    execSync(`git checkout -b ${branchName}`, { stdio: "inherit" });
    console.log(`${colors.brightGreen}✔ Checked out to new branch '${branchName}'.${colors.reset}\n`);
  } catch {
    console.error(`\n${colors.red}Failed to create branch.${colors.reset}\n`);
  }
}

export async function runInteractiveScaffoldWizard(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (q: string): Promise<string> =>
    new Promise((resolve) => rl.question(q, (ans) => resolve(ans.trim())));

  console.log(formatHeader("DX Feature Scaffolding Interactive Wizard", "Vertical Slice Template Generator"));
  console.log(`${colors.bold}Supported Architecture Template Types:${colors.reset}`);
  console.log(`  ${colors.cyan}1)${colors.reset} component   - Reusable UI component (components/ui/ & unit test)`);
  console.log(`  ${colors.cyan}2)${colors.reset} hook        - Custom React hook (hooks/ & unit test)`);
  console.log(`  ${colors.cyan}3)${colors.reset} api         - Zod-validated API route (app/api/ & unit test)`);
  console.log(`  ${colors.cyan}4)${colors.reset} adr         - Architectural Decision Record (adr/00XX-*.md)`);
  console.log(`  ${colors.cyan}5)${colors.reset} case-study  - Interactive Case Study page (app/case-studies/ & test)`);
  console.log(`  ${colors.cyan}6)${colors.reset} arcade      - Arcade simulator & engine (lib/, components/, app/ & tests)`);
  console.log(`  ${colors.cyan}7)${colors.reset} game        - Interactive game module (arcade alias)\n`);

  const typeMenuMap: Record<string, ScaffoldType> = {
    "1": "component",
    "2": "hook",
    "3": "api",
    "4": "adr",
    "5": "case-study",
    "6": "arcade",
    "7": "game",
  };

  let selectedType: ScaffoldType | null = null;
  while (!selectedType) {
    const rawType = await question(`${colors.bold}Select template type [1-7 or name] (default: 1 - component): ${colors.reset}`);
    const choice = rawType === "" ? "1" : rawType.toLowerCase();

    if (typeMenuMap[choice]) {
      selectedType = typeMenuMap[choice];
    } else {
      const typeCheck = validateScaffoldType(choice);
      if (typeCheck.valid) {
        selectedType = choice as ScaffoldType;
      } else {
        console.log(`${colors.brightRed}✖ ${typeCheck.error}${colors.reset}`);
      }
    }
  }

  let selectedName = "";
  while (!selectedName) {
    const rawName = await question(`${colors.bold}Enter feature / asset name (e.g. matrix-defender, analytics-card): ${colors.reset}`);
    const nameCheck = validateScaffoldName(rawName);
    if (nameCheck.valid) {
      selectedName = rawName.trim();
    } else {
      console.log(`${colors.brightRed}✖ ${nameCheck.error}${colors.reset}`);
    }
  }

  const dryRunAns = await question(`${colors.bold}Run in preview / dry-run mode? (y/N): ${colors.reset}`);
  const dryRun = dryRunAns.toLowerCase() === "y" || dryRunAns.toLowerCase() === "yes";

  rl.close();

  console.log(`\n${colors.cyan}Scaffolding ${selectedType.toUpperCase()}: ${selectedName}${colors.reset}`);
  if (dryRun) {
    console.log(`${colors.yellow}[PREVIEW MODE - No files will be modified on disk]${colors.reset}`);
  }
  console.log("");

  try {
    const generated = scaffold({
      type: selectedType,
      name: selectedName,
      dryRun,
      workspaceRoot,
    });
    for (const f of generated) {
      const actionBadge = f.action === "updated" ? badge("UPDATED", "info") : badge("CREATED", "pass");
      console.log(`${actionBadge} ${f.relativePath}`);
    }
    console.log(`\n${colors.brightGreen}✔ Successfully scaffolded ${generated.length} item(s) for ${selectedName}.${colors.reset}\n`);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`\n${colors.brightRed}✖ Scaffolding failed: ${errorMsg}${colors.reset}\n`);
    process.exit(1);
  }
}

async function handleScaffoldCommand(args: string[]): Promise<void> {
  const dryRun = args.includes("--dry-run");
  const posArgs = args.filter((a) => !a.startsWith("--"));

  if (posArgs.length === 0) {
    await runInteractiveScaffoldWizard();
    return;
  }

  const rawType = posArgs[0];
  const rawName = posArgs[1];

  const typeCheck = validateScaffoldType(rawType);
  if (!typeCheck.valid) {
    console.error(`\n${colors.brightRed}✖ ${typeCheck.error}${colors.reset}`);
    console.log(`Usage: npm run dx scaffold <type> <name> [--dry-run]\n`);
    process.exit(1);
  }

  const nameCheck = validateScaffoldName(rawName);
  if (!nameCheck.valid) {
    console.error(`\n${colors.brightRed}✖ ${nameCheck.error}${colors.reset}`);
    console.log(`Usage: npm run dx scaffold <type> <name> [--dry-run]\n`);
    process.exit(1);
  }

  const type = rawType.toLowerCase() as ScaffoldType;
  const name = rawName.trim();

  console.log(formatHeader(`Scaffolding ${type.toUpperCase()}: ${name}`));
  if (dryRun) {
    console.log(`${colors.yellow}[DRY RUN MODE - No files will be modified]${colors.reset}\n`);
  }

  try {
    const generated = scaffold({ type, name, dryRun, workspaceRoot });
    for (const f of generated) {
      const actionBadge = f.action === "updated" ? badge("UPDATED", "info") : badge("CREATED", "pass");
      console.log(`${actionBadge} ${f.relativePath}`);
    }
    console.log(`\n${colors.brightGreen}✔ Successfully scaffolded ${generated.length} item(s) for ${name}.${colors.reset}\n`);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`\n${colors.brightRed}✖ Scaffolding failed: ${errorMsg}${colors.reset}\n`);
    process.exit(1);
  }
}

function handleBenchCommand(args: string[] = []): void {
  if (args.includes("--pages") || args.includes("pages")) {
    console.log(formatHeader("DX Bench: Page Speed & Core Web Vitals", "Real-Browser Chromium • Navigation Timing L2 • Web Vitals"));
    const extraArgs = args.filter((a) => a !== "--pages" && a !== "pages");
    const cmd = "npx tsx scripts/benchmark-pages.ts" + (extraArgs.length > 0 ? " " + extraArgs.join(" ") : "");
    execSync(cmd, { cwd: workspaceRoot, stdio: "inherit" });
    return;
  }
  console.log(formatHeader("DX Bench: Micro-Benchmark Suite", "Pretext Layout • Greedy Masonry • Security Scanner"));
  const results = runAllBenchmarks();
  printBenchmarkReport(results);
}

function handleCleanCommand(): void {
  console.log(formatHeader("DX Clean: Developer Environment Sanitizer"));
  const pathsToClean = [
    path.join(workspaceRoot, ".next"),
    path.join(workspaceRoot, "tsconfig.tsbuildinfo"),
    path.join(workspaceRoot, "coverage"),
    path.join(workspaceRoot, ".turbo"),
  ];

  for (const p of pathsToClean) {
    if (fs.existsSync(p)) {
      console.log(`${colors.yellow}Removing ${path.relative(workspaceRoot, p)}...${colors.reset}`);
      fs.rmSync(p, { recursive: true, force: true });
    }
  }

  console.log(`\n${colors.cyan}Regenerating Prisma Client & Design Theme Tokens...${colors.reset}`);
  execSync("npx prisma generate", { cwd: workspaceRoot, stdio: "inherit" });
  execSync("npx tsx scripts/generate-theme.ts", { cwd: workspaceRoot, stdio: "inherit" });

  console.log(`\n${colors.brightGreen}✅ Clean completed. Workspace is in a pristine, fresh state.${colors.reset}\n`);
}

async function runInteractiveMenu(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(formatHeader("Developer Experience (DX) Interactive Suite", "Next.js 16 • React 19 • Pretext Layout Engine"));
  console.log(`${colors.bold}Choose an action:${colors.reset}`);
  console.log(`  ${colors.cyan}0)${colors.reset} Interactive Developer Onboarding & Setup`);
  console.log(`  ${colors.cyan}1)${colors.reset} Invariant Doctor (Health Check)`);
  console.log(`  ${colors.cyan}2)${colors.reset} Invariant Doctor with Auto-Fix`);
  console.log(`  ${colors.cyan}3)${colors.reset} Interactive Conventional Commit Wizard`);
  console.log(`  ${colors.cyan}4)${colors.reset} Interactive Git Branch Generator`);
  console.log(`  ${colors.cyan}5)${colors.reset} Validate Environment & Schema (.env.example)`);
  console.log(`  ${colors.cyan}6)${colors.reset} Scan for Dead Code & Unused Exports`);
  console.log(`  ${colors.cyan}7)${colors.reset} Inspect Production Bundle Chunks & Budgets`);
  console.log(`  ${colors.cyan}8)${colors.reset} Scaffold New Code Template (Arcade, API, ADR, Component)`);
  console.log(`  ${colors.cyan}9)${colors.reset} Run Micro-Benchmarks (Pretext & Math)`);
  console.log(`  ${colors.cyan}10)${colors.reset} Clean Caches & Rebuild Tokens`);
  console.log(`  ${colors.cyan}11)${colors.reset} Exit\n`);

  rl.question(`${colors.bold}${colors.brightWhite}Select an option [0-11]: ${colors.reset}`, async (answer) => {
    rl.close();
    const choice = answer.trim();

    switch (choice) {
      case "0":
        await handleSetupCommand([]);
        break;
      case "1":
        await handleDoctorCommand([]);
        break;
      case "2":
        await handleDoctorCommand(["--fix"]);
        break;
      case "3":
        await handleCommitCommand();
        break;
      case "4":
        await handleBranchCommand();
        break;
      case "5":
        await handleEnvCommand([]);
        break;
      case "6":
        handleDeadCodeCommand();
        break;
      case "7":
        handleAnalyzeCommand([]);
        break;
      case "8": {
        await runInteractiveScaffoldWizard();
        break;
      }
      case "9":
        handleBenchCommand([]);
        break;
      case "10":
        handleCleanCommand();
        break;
      case "11":
      default:
        console.log(`\n${colors.gray}Exiting DX Suite.${colors.reset}\n`);
        process.exit(0);
    }
  });
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    await runInteractiveMenu();
    return;
  }

  switch (command) {
    case "setup":
    case "init":
    case "onboard":
      await handleSetupCommand(args.slice(1));
      break;
    case "doctor":
      await handleDoctorCommand(args.slice(1));
      break;
    case "verify":
    case "check":
      await handleVerifyCommand();
      break;
    case "commit":
    case "cz":
      await handleCommitCommand();
      break;
    case "branch":
      await handleBranchCommand();
      break;
    case "env":
      await handleEnvCommand(args.slice(1));
      break;
    case "dead-code":
    case "unused":
      handleDeadCodeCommand();
      break;
    case "analyze":
    case "bundle":
      handleAnalyzeCommand(args.slice(1));
      break;
    case "scaffold":
    case "g":
      await handleScaffoldCommand(args.slice(1));
      break;
    case "build:icons":
    case "generate:icons":
    case "icons":
      console.log(formatHeader("DX Asset Engine: Multi-Resolution Brand Icons"));
      execSync("npx tsx scripts/generate-brand-icons.ts", { cwd: workspaceRoot, stdio: "inherit" });
      break;
    case "build:theme":
    case "generate:theme":
    case "theme":
      console.log(formatHeader("DX Theme Compiler: Design Token Manifest Generator"));
      execSync("npx tsx scripts/generate-theme.ts", { cwd: workspaceRoot, stdio: "inherit" });
      break;
    case "bench":
    case "benchmark":
    case "bench:pages":
      handleBenchCommand(command === "bench:pages" ? ["--pages", ...args.slice(1)] : args.slice(1));
      break;
    case "crf":
      execSync(`npx tsx ${path.resolve(__dirname, "crf.ts")} ${args.slice(1).join(" ")}`, { stdio: "inherit" });
      break;
    case "clean":
    case "reset":
      handleCleanCommand();
      break;
    case "help":
    case "--help":
    case "-h":
      printUsage();
      break;
    default:
      console.error(`\n${colors.red}Unknown command: ${command}${colors.reset}`);
      printUsage();
      process.exit(1);
  }
}

if (typeof process.env.VITEST === "undefined") {
  main().catch((err) => {
    console.error(`\n${colors.brightRed}Fatal error in DX CLI:${colors.reset}`, err);
    process.exit(1);
  });
}

#!/usr/bin/env node
/**
 * Developer Experience (DX) Suite & Invariant CLI
 * Zero-dependency TypeScript task runner and architecture guard
 */

import readline from "readline";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import { runDiagnostics, printDoctorReport } from "../lib/dx/doctor";
import { scaffold, type ScaffoldType } from "../lib/dx/scaffolder";
import { runAllBenchmarks, printBenchmarkReport } from "../lib/dx/bench";
import { colors, formatHeader, badge } from "../lib/dx/utils";

const workspaceRoot = path.resolve(__dirname, "..");

function printUsage(): void {
  console.log(formatHeader("Developer Experience (DX) Suite & Invariant Engine", "Next.js 16 • React 19 • Pretext Layout Engine"));
  console.log(`${colors.bold}Usage:${colors.reset} dx <command> [options]\n`);
  console.log(`${colors.bold}Commands:${colors.reset}`);
  console.log(`  ${colors.cyan}doctor${colors.reset}                 Run architectural & invariant health diagnostics`);
  console.log(`  ${colors.cyan}doctor --fix${colors.reset}           Run diagnostics and automatically fix remediable issues`);
  console.log(`  ${colors.cyan}verify${colors.reset}                 Strict invariant check for CI / pre-commit (exits with code 1 on failure)`);
  console.log(`  ${colors.cyan}scaffold <type> <name>${colors.reset} Scaffold code templates (types: arcade, api, adr, case-study, component)`);
  console.log(`  ${colors.cyan}bench${colors.reset}                  Run Pretext, Masonry Scheduler, and Security benchmarks`);
  console.log(`  ${colors.cyan}bench --pages${colors.reset}          Run real-browser Core Web Vitals & page speed benchmarks`);
  console.log(`  ${colors.cyan}clean${colors.reset}                  Clean build artifacts and reset developer cache`);
  console.log(`  ${colors.cyan}help${colors.reset}                   Show this help menu\n`);
  console.log(`${colors.bold}Examples:${colors.reset}`);
  console.log(`  $ npm run dx doctor`);
  console.log(`  $ npm run dx doctor -- --fix`);
  console.log(`  $ npm run dx scaffold arcade matrix-defender`);
  console.log(`  $ npm run dx scaffold api webhook-handler`);
  console.log(`  $ npm run dx scaffold adr state-machine-transitions`);
  console.log(`  $ npm run dx bench`);
  console.log(`  $ npm run dx bench --pages\n`);
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

async function handleScaffoldCommand(args: string[]): Promise<void> {
  const type = args[0] as ScaffoldType;
  const name = args[1];
  const dryRun = args.includes("--dry-run");

  const validTypes: ScaffoldType[] = ["arcade", "game", "api", "adr", "case-study", "component", "hook"];

  if (!type || !validTypes.includes(type) || !name) {
    console.log(formatHeader("DX Scaffolder: Interactive Template Generator"));
    console.log(`${colors.yellow}Please specify both a valid type and name.${colors.reset}`);
    console.log(`Valid types: ${validTypes.join(", ")}`);
    console.log(`Usage: npm run dx scaffold <type> <name> [--dry-run]\n`);
    return;
  }

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
    execSync("npx tsx scripts/benchmark-pages.ts", { cwd: workspaceRoot, stdio: "inherit" });
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
  console.log(`  ${colors.cyan}1)${colors.reset} Invariant Doctor (Health Check)`);
  console.log(`  ${colors.cyan}2)${colors.reset} Invariant Doctor with Auto-Fix`);
  console.log(`  ${colors.cyan}3)${colors.reset} Scaffold New Arcade Mini-Game`);
  console.log(`  ${colors.cyan}4)${colors.reset} Scaffold New API Route`);
  console.log(`  ${colors.cyan}5)${colors.reset} Scaffold Architecture Decision Record (ADR)`);
  console.log(`  ${colors.cyan}6)${colors.reset} Run Micro-Benchmarks (Pretext & Math)`);
  console.log(`  ${colors.cyan}7)${colors.reset} Run Page Speed & Web Vitals Benchmarks`);
  console.log(`  ${colors.cyan}8)${colors.reset} Clean Caches & Rebuild Tokens`);
  console.log(`  ${colors.cyan}9)${colors.reset} Exit\n`);

  rl.question(`${colors.bold}${colors.brightWhite}Select an option [1-9]: ${colors.reset}`, async (answer) => {
    rl.close();
    const choice = answer.trim();

    switch (choice) {
      case "1":
        await handleDoctorCommand([]);
        break;
      case "2":
        await handleDoctorCommand(["--fix"]);
        break;
      case "3": {
        const rl2 = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl2.question(`Enter arcade game name (e.g. quantum-flux): `, async (gameName) => {
          rl2.close();
          if (gameName.trim()) {
            await handleScaffoldCommand(["arcade", gameName.trim()]);
          }
        });
        break;
      }
      case "4": {
        const rl2 = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl2.question(`Enter API route name (e.g. system-metrics): `, async (apiName) => {
          rl2.close();
          if (apiName.trim()) {
            await handleScaffoldCommand(["api", apiName.trim()]);
          }
        });
        break;
      }
      case "5": {
        const rl2 = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl2.question(`Enter ADR title slug (e.g. streaming-telemetry-protocol): `, async (adrName) => {
          rl2.close();
          if (adrName.trim()) {
            await handleScaffoldCommand(["adr", adrName.trim()]);
          }
        });
        break;
      }
      case "6":
        handleBenchCommand([]);
        break;
      case "7":
        handleBenchCommand(["--pages"]);
        break;
      case "8":
        handleCleanCommand();
        break;
      case "9":
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
    case "doctor":
      await handleDoctorCommand(args.slice(1));
      break;
    case "verify":
    case "check":
      await handleVerifyCommand();
      break;
    case "scaffold":
    case "g":
    case "generate":
      await handleScaffoldCommand(args.slice(1));
      break;
    case "bench":
    case "benchmark":
    case "bench:pages":
      handleBenchCommand(command === "bench:pages" ? ["--pages", ...args.slice(1)] : args.slice(1));
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

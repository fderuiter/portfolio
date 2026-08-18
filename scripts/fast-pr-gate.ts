#!/usr/bin/env node
/**
 * In-Line Fast PR Performance Gate Runner
 * Runs compute micro-benchmarks and key route page performance benchmarks.
 * Appends summary dashboards to $GITHUB_STEP_SUMMARY and fails PR builds if performance budgets are breached.
 */

import { spawn, type ChildProcess } from "child_process";
import http from "http";
import path from "path";
import fs from "fs";
import {
  runAllBenchmarks,
  verifyComputeBudgets,
  printBenchmarkReport,
  generateComputeMarkdownReport,
} from "../lib/dx/bench";
import {
  KEY_ROUTES,
  runPageBenchmarks,
  printPageBenchmarkReport,
  generateMarkdownReport,
} from "../lib/dx/page-bench";
import { colors, formatHeader, formatSection } from "../lib/dx/utils";

async function isServerReady(urlStr: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const url = new URL(urlStr);
      const req = http.request(
        {
          hostname: url.hostname,
          port: url.port || 80,
          path: url.pathname || "/",
          method: "GET",
          timeout: 2000,
        },
        (res) => {
          resolve(res.statusCode !== undefined && res.statusCode < 500);
        }
      );
      req.on("error", () => resolve(false));
      req.on("timeout", () => {
        req.destroy();
        resolve(false);
      });
      req.end();
    } catch {
      resolve(false);
    }
  });
}

async function waitForServer(urlStr: string, maxWaitMs = 30000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    if (await isServerReady(urlStr)) {
      return true;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

export async function runFastPRGate(): Promise<void> {
  console.log(
    formatHeader(
      "In-Line Fast PR Performance Gate",
      "Compute Micro-Benchmarks & Filtered Key Route Page Speed Suite"
    )
  );

  let hasFailures = false;
  const summaryMarkdownChunks: string[] = [
    "## 🛡️ In-Line Fast PR Performance Gate Report\n",
  ];

  // ==========================================
  // STEP 1: COMPUTE ENGINE MICRO-BENCHMARKS
  // ==========================================
  console.log(formatSection("Step 1: Compute Engine Micro-Benchmarks"));
  const rawComputeResults = runAllBenchmarks();
  const computeEvaluation = verifyComputeBudgets(rawComputeResults);

  printBenchmarkReport(computeEvaluation.results);
  const computeMarkdown = generateComputeMarkdownReport(computeEvaluation.results);
  summaryMarkdownChunks.push(computeMarkdown);

  if (!computeEvaluation.passed) {
    hasFailures = true;
    console.error(
      `\n${colors.brightRed}❌ Compute Engine Micro-Benchmark Budget SLA Breached!${colors.reset}`
    );
    for (const v of computeEvaluation.violations) {
      console.error(`  ${colors.red}• ${v}${colors.reset}`);
    }
  } else {
    console.log(
      `\n${colors.brightGreen}✔ Compute Engine Micro-Benchmarks passed all performance budgets.${colors.reset}\n`
    );
  }

  // ==========================================
  // STEP 2: KEY ROUTE PAGE SPEED BENCHMARKS
  // ==========================================
  console.log(formatSection("Step 2: Key Route Page Speed Evaluation"));
  const baseUrl = process.env.TEST_URL || "http://localhost:3000";
  let spawnedServer: ChildProcess | null = null;

  try {
    const isLive = await isServerReady(baseUrl);
    if (!isLive) {
      const dotNext = path.join(process.cwd(), ".next");
      if (!fs.existsSync(dotNext)) {
        console.log(
          `${colors.yellow}Production build not found. Building project...${colors.reset}`
        );
        const { execSync } = await import("child_process");
        execSync("npm run build", { stdio: "inherit", cwd: process.cwd() });
      }

      console.log(
        `${colors.cyan}Starting Next.js production server at ${baseUrl}...${colors.reset}`
      );
      spawnedServer = spawn("npx", ["next", "start", "-p", "3000"], {
        cwd: process.cwd(),
        stdio: "ignore",
        detached: false,
      });

      const ready = await waitForServer(baseUrl, 30000);
      if (!ready) {
        throw new Error(
          "Next.js server failed to become ready within 30 seconds."
        );
      }
      console.log(`${colors.brightGreen}✔ Production server active.${colors.reset}\n`);
    } else {
      console.log(
        `${colors.brightGreen}✔ Connected to target server at ${baseUrl}.${colors.reset}\n`
      );
    }

    console.log(
      `${colors.cyan}Executing real-browser Page Benchmarks on ${KEY_ROUTES.length} Key Route(s)...${colors.reset}`
    );
    let currentIdx = 0;

    const pageSummaries = await runPageBenchmarks({
      baseUrl,
      runs: 2,
      routes: KEY_ROUTES,
      onProgress: ({ route, currentRun, totalRuns, metrics }) => {
        if (currentRun === 0) {
          currentIdx++;
          process.stdout.write(
            `  [${currentIdx}/${KEY_ROUTES.length}] ${route.path.padEnd(32)} (warmup)... `
          );
        } else if (currentRun === totalRuns) {
          process.stdout.write(
            `run ${currentRun}/${totalRuns} (LCP: ${metrics?.lcp ?? 0}ms) ✔\n`
          );
        } else {
          process.stdout.write(`run ${currentRun}/${totalRuns}... `);
        }
      },
    });

    printPageBenchmarkReport(pageSummaries);
    const pageMarkdown = generateMarkdownReport(pageSummaries, baseUrl);
    summaryMarkdownChunks.push(pageMarkdown);

    const failedPageCount = pageSummaries.filter((s) => !s.passedBudget).length;
    if (failedPageCount > 0) {
      hasFailures = true;
      console.error(
        `\n${colors.brightRed}❌ Key Route Page Performance Gate Breached: ${failedPageCount} route(s) failed Core Web Vitals targets.${colors.reset}`
      );
    } else {
      console.log(
        `\n${colors.brightGreen}✔ All key routes passed Core Web Vitals performance budgets.${colors.reset}\n`
      );
    }
  } catch (err: unknown) {
    hasFailures = true;
    const msg = err instanceof Error ? err.message : String(err);
    console.error(
      `\n${colors.brightRed}❌ Key Route Page Benchmark Execution Error: ${msg}${colors.reset}\n`
    );
  } finally {
    if (spawnedServer) {
      console.log(`${colors.dim}Stopping temporary Next.js server...${colors.reset}`);
      spawnedServer.kill("SIGTERM");
    }
  }

  // ==========================================
  // STEP 3: PUBLISH TO GITHUB STEP SUMMARY
  // ==========================================
  const summaryFilePath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryFilePath) {
    try {
      const fullMarkdown = summaryMarkdownChunks.join("\n\n");
      fs.appendFileSync(summaryFilePath, fullMarkdown, "utf8");
      console.log(
        `${colors.brightGreen}✔ Published In-Line Performance Gate summary to $GITHUB_STEP_SUMMARY.${colors.reset}\n`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(
        `${colors.yellow}Warning: Failed writing to $GITHUB_STEP_SUMMARY: ${msg}${colors.reset}`
      );
    }
  }

  // ==========================================
  // STEP 4: DECISION & EXIT CODE
  // ==========================================
  if (hasFailures) {
    console.error(
      `${colors.brightRed}⛔ In-Line Performance Gate Status: FAILED. Breached performance budget SLA(s).${colors.reset}\n`
    );
    process.exit(1);
  } else {
    console.log(
      `${colors.brightGreen}🎉 In-Line Performance Gate Status: PASSED. All SLA budgets satisfied.${colors.reset}\n`
    );
  }
}

if (require.main === module) {
  runFastPRGate().catch((err) => {
    console.error("Fatal error in Fast PR Performance Gate:", err);
    process.exit(1);
  });
}

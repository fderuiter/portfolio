#!/usr/bin/env node
/**
 * Page Benchmark CLI & Core Web Vitals Runner
 * Measures real-browser performance and Core Web Vitals across portfolio pages.
 */

import { spawn, type ChildProcess } from "child_process";
import http from "http";
import path from "path";
import fs from "fs";
import {
  CANONICAL_ROUTES,
  KEY_ROUTES,
  runPageBenchmarks,
  printPageBenchmarkReport,
  exportBenchmarkResults,
  type PageBenchmarkRoute,
} from "../lib/dx/page-bench";
import { colors, formatHeader } from "../lib/dx/utils";

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

export async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // CLI Arguments
  let baseUrl = "http://localhost:3000";
  let runs = 3;
  let assertBudget = false;
  let isMobile = false;
  let routeFilter: string | null = null;
  let keyOnly = false;
  let outputDir = process.cwd();

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--url" && args[i + 1]) {
      baseUrl = args[++i];
    } else if (arg === "--runs" && args[i + 1]) {
      runs = parseInt(args[++i], 10) || 3;
    } else if (arg === "--assert" || arg === "--budget") {
      assertBudget = true;
    } else if (arg === "--mobile" || arg === "-m") {
      isMobile = true;
    } else if (arg === "--key-routes" || arg === "--key-only" || arg === "--fast") {
      keyOnly = true;
    } else if (arg === "--routes" && args[i + 1]) {
      routeFilter = args[++i];
    } else if (arg === "--output" && args[i + 1]) {
      outputDir = path.resolve(args[++i]);
    } else if (arg === "--help" || arg === "-h") {
      console.log(formatHeader("Page Performance Benchmarking CLI", "Real-Browser Navigation & Core Web Vitals"));
      console.log(`${colors.bold}Usage:${colors.reset} npx tsx scripts/benchmark-pages.ts [options]\n`);
      console.log(`${colors.bold}Options:${colors.reset}`);
      console.log(`  --url <url>        Target server URL (default: http://localhost:3000)`);
      console.log(`  --runs <n>         Number of measured runs per page (default: 3)`);
      console.log(`  --mobile, -m       Emulate mobile device viewport (iPhone/Pixel 390x844 with touch)`);
      console.log(`  --key-routes       Benchmark key routes subset only`);
      console.log(`  --routes <pattern> Filter routes by pattern (e.g. 'arcade', 'proof', 'key')`);
      console.log(`  --assert, --budget Exit with code 1 if any page fails Web Vitals budget`);
      console.log(`  --output <dir>     Export directory for benchmark-results.md/.json`);
      console.log(`  --help, -h         Show help menu\n`);
      process.exit(0);
    }
  }

  let selectedRoutes: PageBenchmarkRoute[] = keyOnly ? KEY_ROUTES : CANONICAL_ROUTES;
  if (routeFilter) {
    if (routeFilter.toLowerCase() === "key" || routeFilter.toLowerCase() === "key-routes") {
      selectedRoutes = KEY_ROUTES;
    } else {
      const regex = new RegExp(routeFilter, "i");
      selectedRoutes = CANONICAL_ROUTES.filter((r) => regex.test(r.path) || regex.test(r.name));
    }
    if (selectedRoutes.length === 0) {
      console.error(`${colors.brightRed}Error: No routes matched filter '${routeFilter}'.${colors.reset}`);
      process.exit(1);
    }
  }

  let spawnedServer: ChildProcess | null = null;

  try {
    const isLive = await isServerReady(baseUrl);
    if (!isLive) {
      const isLocalhost = baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");
      if (!isLocalhost) {
        console.error(`${colors.brightRed}Error: Remote target ${baseUrl} is unreachable.${colors.reset}`);
        process.exit(1);
      }

      const dotNext = path.join(process.cwd(), ".next");
      if (!fs.existsSync(dotNext)) {
        console.log(`${colors.yellow}Production build not found. Building project with 'npm run build'...${colors.reset}`);
        const { execSync } = await import("child_process");
        execSync("npm run build", { stdio: "inherit", cwd: process.cwd() });
      }

      console.log(`${colors.cyan}Starting Next.js production server at ${baseUrl}...${colors.reset}`);
      spawnedServer = spawn("npx", ["next", "start", "-p", "3000"], {
        cwd: process.cwd(),
        stdio: "ignore",
        detached: false,
      });

      const ready = await waitForServer(baseUrl, 30000);
      if (!ready) {
        throw new Error("Spawned Next.js server failed to become ready within 30 seconds.");
      }
      console.log(`${colors.brightGreen}✔ Production server active.${colors.reset}\n`);
    } else {
      console.log(`${colors.brightGreen}✔ Connected to active target server at ${baseUrl}.${colors.reset}\n`);
    }

    console.log(`${colors.cyan}Running real-browser benchmarks on ${selectedRoutes.length} route(s)...${colors.reset}`);
    let currentRouteIdx = 0;

    const summaries = await runPageBenchmarks({
      baseUrl,
      runs,
      routes: selectedRoutes,
      isMobile,
      onProgress: ({ route, currentRun, totalRuns, metrics }) => {
        if (currentRun === 0) {
          currentRouteIdx++;
          process.stdout.write(`  [${currentRouteIdx}/${selectedRoutes.length}] ${route.path.padEnd(35)} (warmup)... `);
        } else if (currentRun === totalRuns) {
          process.stdout.write(`run ${currentRun}/${totalRuns} (LCP: ${metrics?.lcp ?? 0}ms) ✔\n`);
        } else {
          process.stdout.write(`run ${currentRun}/${totalRuns}... `);
        }
      },
    });

    console.log("");
    printPageBenchmarkReport(summaries, baseUrl);

    const { jsonPath, markdownPath } = exportBenchmarkResults(summaries, outputDir, baseUrl);
    console.log(`${colors.dim}Exported reports:${colors.reset}`);
    console.log(`  • Markdown: ${colors.cyan}${path.relative(process.cwd(), markdownPath)}${colors.reset}`);
    console.log(`  • JSON:     ${colors.cyan}${path.relative(process.cwd(), jsonPath)}${colors.reset}\n`);

    if (assertBudget) {
      const failed = summaries.filter((s) => !s.passedBudget);
      if (failed.length > 0) {
        console.error(
          `${colors.brightRed}❌ Performance budget assertion failed: ${failed.length} page(s) exceeded SLA thresholds.${colors.reset}\n`
        );
        process.exit(1);
      } else {
        console.log(`${colors.brightGreen}✅ All pages passed Web Vitals performance budget.${colors.reset}\n`);
      }
    }
  } catch (err) {
    console.error(`\n${colors.brightRed}Benchmark execution error:${colors.reset}`, err);
    process.exit(1);
  } finally {
    if (spawnedServer && !spawnedServer.killed) {
      console.log(`${colors.dim}Shutting down spawned benchmark server...${colors.reset}`);
      spawnedServer.kill("SIGTERM");
    }
  }
}

if (typeof process.env.VITEST === "undefined" && require.main === module) {
  main();
}

#!/usr/bin/env node
/**
 * Shift-Left Property Fuzz Testing Gateway Runner
 * Evaluates test resilience and logic invariants using fast-check generative fuzzing.
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const workspaceRoot = path.resolve(__dirname, "..");

export interface PropertyFuzzGateResult {
  passed: boolean;
  totalPropertyTests: number;
  passedPropertyTests: number;
  failedPropertyTests: number;
  details: string[];
}

export type MutationGateResult = PropertyFuzzGateResult;

export function runPropertyFuzzGate(): PropertyFuzzGateResult {
  const details: string[] = [];

  // Verify target files exist
  const targets = [
    "lib/proof-utils.ts",
    "lib/masonry.ts",
    "lib/error-sanitization.ts",
    "lib/security.ts",
  ];

  for (const target of targets) {
    const fullPath = path.join(workspaceRoot, target);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Property fuzz target missing: ${target}`);
    }
  }
  details.push(`✔ Property fuzzing target modules verified (${targets.join(", ")})`);

  // Execute fast-check property test suite via Vitest with JSON reporter to get actual test results
  try {
    const output = execSync("npx vitest run __tests__/property-fuzz.test.ts --reporter=json", {
      cwd: workspaceRoot,
      stdio: ["pipe", "pipe", "pipe"],
      encoding: "utf-8",
      env: { ...process.env, VITE_CONFIG_NATIVE_IGNORE_WARNING: "1" },
    });

    const result = JSON.parse(output);
    const total = result.numTotalTests ?? 0;
    const passed = result.numPassedTests ?? 0;
    const failed = result.numFailedTests ?? 0;
    const isSuccess = result.success ?? (failed === 0 && total > 0);

    details.push(`✔ Fast-check property test suite executed: ${passed}/${total} property assertions passed`);
    if (failed > 0) {
      details.push(`❌ ${failed} property test(s) failed`);
    }

    return {
      passed: isSuccess,
      totalPropertyTests: total,
      passedPropertyTests: passed,
      failedPropertyTests: failed,
      details,
    };
  } catch (err: unknown) {
    // If vitest exits non-zero, stderr/stdout might contain JSON or error
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (typeof err === "object" && err !== null && "stdout" in err && typeof (err as { stdout?: unknown }).stdout === "string") {
      try {
        const result = JSON.parse((err as { stdout: string }).stdout);
        const total = result.numTotalTests ?? 0;
        const passed = result.numPassedTests ?? 0;
        const failed = result.numFailedTests ?? 0;
        details.push(`❌ Property test suite failed: ${passed}/${total} passed, ${failed} failed`);
        return {
          passed: false,
          totalPropertyTests: total,
          passedPropertyTests: passed,
          failedPropertyTests: failed,
          details,
        };
      } catch {
        // Fall back to message
      }
    }
    details.push(`❌ Fast-check property test execution failed: ${errorMsg}`);
    return {
      passed: false,
      totalPropertyTests: 0,
      passedPropertyTests: 0,
      failedPropertyTests: 1,
      details,
    };
  }
}

export const runMutationGate = runPropertyFuzzGate;

if (require.main === module) {
  console.log("\n🛡️ Running Shift-Left Property Fuzz Testing Gateway...");
  const result = runPropertyFuzzGate();
  for (const msg of result.details) {
    console.log(`  ${msg}`);
  }
  if (!result.passed) {
    console.error(`\n❌ Property fuzz gate failed! (${result.failedPropertyTests} failures)`);
    process.exit(1);
  } else {
    console.log(`\n✅ Shift-Left Property Fuzz Gateway passed (${result.passedPropertyTests}/${result.totalPropertyTests} property tests passed).\n`);
    process.exit(0);
  }
}

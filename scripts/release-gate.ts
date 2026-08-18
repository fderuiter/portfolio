#!/usr/bin/env tsx
import child_process from "child_process";
import * as checkMigrations from "./check-migrations";

function runStep(command: string, args: string[]): void {
  console.log(`Executing: ${command} ${args.join(" ")}`);
  const result = child_process.spawnSync(command, args, { stdio: "inherit", shell: true, env: process.env });
  if (result.status !== 0) {
    console.error(`Error: Command "${command} ${args.join(" ")}" failed with exit code ${result.status}`);
    process.exit(result.status ?? 1);
  }
}

export function executeReleaseGate(): void {
  console.log("=== 🚀 Starting Pipeline Release Gate Stage ===");

  // Step 1: Execute Unified Migration Validator (Offline Integrity, Provider Parity, Destructive Guard)
  console.log("\n--- Step 1: Running Unified Migration Safety & Integrity Validation ---");
  try {
    checkMigrations.runUnifiedMigrationCheck();
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`\n❌ Release Gate Halted: Unified migration check failed: ${errorMsg}`);
    process.exit(1);
  }

  // Step 2: Deploy Database Migrations with Dedicated Release-Stage Credentials
  console.log("\n--- Step 2: Applying Database Migrations (prisma migrate deploy) ---");
  runStep("npx", ["prisma", "migrate", "deploy"]);

  console.log("\n=== ✅ Release Gate Passed: Database Migrations Applied Successfully ===");
}

if (require.main === module || (process.argv[1] && process.argv[1].includes("release-gate") && !process.env.VITEST)) {
  executeReleaseGate();
}

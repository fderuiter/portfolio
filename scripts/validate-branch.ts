#!/usr/bin/env node
import { execSync } from "child_process";
import { validateBranchName } from "../lib/dx/git-guard";
import { colors } from "../lib/dx/utils";

function getCurrentBranch(): string {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf-8" }).trim();
  } catch {
    return "HEAD";
  }
}

function main() {
  const branch = process.argv[2] || getCurrentBranch();
  const result = validateBranchName(branch);

  if (!result.valid) {
    console.error(`\n${colors.brightRed}❌ Git Branch validation failed:${colors.reset}`);
    console.error(`  ${colors.red}${result.error}${colors.reset}\n`);
    process.exit(1);
  }

  console.log(`${colors.brightGreen}✔ Branch '${branch}' conforms to naming conventions.${colors.reset}`);
  process.exit(0);
}

if (typeof process.env.VITEST === "undefined") {
  main();
}

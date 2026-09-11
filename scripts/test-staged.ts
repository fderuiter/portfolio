import { execFileSync } from "node:child_process";

const CODE_FILE = /\.(?:[cm]?js|jsx|tsx?)$/u;

/** Returns staged files (added/copied/modified/renamed) relevant to the test module graph. */
export function getStagedTestableFiles(cwd: string): string[] {
  const output = execFileSync(
    "git",
    ["diff", "--cached", "--name-only", "--diff-filter=ACMR"],
    { cwd, encoding: "utf-8" }
  );

  return output
    .split("\n")
    .map((file) => file.trim())
    .filter((file) => file.length > 0 && CODE_FILE.test(file));
}

/**
 * Runs vitest's related-tests mode scoped to the staged module graph, per
 * AGENTS.md's pre-commit testing invariant. Avoids the full-suite run that
 * makes `.husky/pre-commit` too slow to be committable (#648).
 */
export function runStagedTests(cwd: string): void {
  const files = getStagedTestableFiles(cwd);

  if (files.length === 0) {
    console.log(
      "No staged source or test files affect the module graph — skipping."
    );
    return;
  }

  execFileSync(
    "npx",
    ["vitest", "related", "--run", "--passWithNoTests", ...files],
    {
      cwd,
      stdio: "inherit",
      env: { ...process.env, VITE_CONFIG_NATIVE_IGNORE_WARNING: "1" },
    }
  );
}

if (require.main === module) {
  try {
    runStagedTests(process.cwd());
  } catch (error) {
    const status = (error as { status?: number | null }).status;
    process.exitCode = typeof status === "number" ? status : 1;
  }
}

/* eslint-disable no-console */
import { execSync } from "child_process";

function checkDrift() {
  console.log("Checking for documentation drift...");
  
  // 1. Run compilation
  try {
    console.log("Compiling documentation...");
    execSync("npm run compile-docs", { stdio: "inherit" });
  } catch {
    console.error("❌ Documentation compilation failed.");
    process.exit(1);
  }

  // 2. Check for unstaged changes in docs/
  let hasDrift = false;
  let driftSummary = "";

  try {
    execSync("git diff --exit-code docs", { stdio: "ignore" });
  } catch {
    hasDrift = true;
    driftSummary += "• Modified/drifted files exist in docs/\n";
  }

  // 3. Check for untracked files in docs/
  try {
    const untrackedFiles = execSync("git ls-files --others --exclude-standard docs", { encoding: "utf-8" }).trim();
    if (untrackedFiles.length > 0) {
      hasDrift = true;
      driftSummary += "• Untracked files exist in docs/:\n" + untrackedFiles + "\n";
    }
  } catch {
    console.error("❌ Failed to check for untracked files.");
    process.exit(1);
  }

  if (hasDrift) {
    console.error("\n❌ [DRIFT DETECTED] The compiled documentation is out of sync with the codebase!");
    console.error(driftSummary);
    console.error("\n👉 Please run 'npm run compile-docs' locally to update the documentation, review and stage/commit the changes.\n");
    process.exit(1);
  } else {
    console.log("✅ No documentation drift detected. All API contracts are perfectly synchronized.");
    process.exit(0);
  }
}

checkDrift();

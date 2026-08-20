/* eslint-disable no-console */
import { execSync } from "child_process";
import path from "path";
import { generateOpenApi } from "./generate-openapi";
import { checkOnboardingDocsDrift, checkDirectoryTopology } from "../lib/dx/doctor";

function checkDrift() {
  console.log("Checking for documentation and specification drift...");
  const workspaceRoot = path.resolve(__dirname, "..");
  
  // 1. Check TypeDoc documentation compilation & drift
  let docsDrift = false;
  let driftSummary = "";

  try {
    console.log("Compiling documentation via TypeDoc...");
    execSync("npm run compile-docs", { cwd: workspaceRoot, stdio: "inherit" });
  } catch {
    console.error("❌ Documentation compilation failed.");
    process.exit(1);
  }

  try {
    execSync("git diff --exit-code docs", { cwd: workspaceRoot, stdio: "ignore" });
  } catch {
    docsDrift = true;
    driftSummary += "• Modified/drifted files exist in docs/\n";
  }

  try {
    const untrackedFiles = execSync("git ls-files --others --exclude-standard docs", { cwd: workspaceRoot, encoding: "utf-8" }).trim();
    if (untrackedFiles.length > 0) {
      docsDrift = true;
      driftSummary += "• Untracked files exist in docs/:\n" + untrackedFiles + "\n";
    }
  } catch {
    console.error("❌ Failed to check for untracked files in docs/.");
    process.exit(1);
  }

  // 2. Check OpenAPI Specification parity and route coverage
  console.log("Checking OpenAPI contract synchronization and route coverage...");
  const { missingRoutes, hasDrift: openApiDrift } = generateOpenApi(workspaceRoot);

  if (missingRoutes.length > 0) {
    docsDrift = true;
    driftSummary += `• Undocumented API routes detected (${missingRoutes.length}):\n` + missingRoutes.map((r) => `  - ${r}`).join("\n") + "\n";
  }

  if (openApiDrift) {
    docsDrift = true;
    driftSummary += "• openapi.json is out of sync with scripts/generate-openapi.ts\n";
  }

  // 3. Check Onboarding Documentation alignment with engine constraints
  console.log("Checking onboarding documentation synchronization...");
  const onboardingResult = checkOnboardingDocsDrift(workspaceRoot);
  if (onboardingResult.status === "fail") {
    docsDrift = true;
    driftSummary += "• Onboarding documentation drift detected:\n" + (onboardingResult.details || []).map((d) => `  - ${d}`).join("\n") + "\n";
  }

  // 4. Check System Architecture Directory Topology alignment
  console.log("Checking architectural directory topology synchronization...");
  const topologyResult = checkDirectoryTopology(workspaceRoot);
  if (topologyResult.status === "fail") {
    docsDrift = true;
    driftSummary += "• Architectural directory topology drift detected:\n" + (topologyResult.details || []).map((d) => `  - ${d}`).join("\n") + "\n";
  }

  if (docsDrift) {
    console.error("\n❌ [DRIFT DETECTED] Technical specifications or documentation are out of sync with the codebase!");
    console.error(driftSummary);
    console.error("👉 Please run 'npm run compile-docs' or 'npm run doctor:fix' locally to update specs, then commit the changes.\n");
    process.exit(1);
  } else {
    console.log("✅ No documentation or specification drift detected. All API contracts and docs are synchronized.");
    process.exit(0);
  }
}

checkDrift();

/* eslint-disable no-console */
import path from "path";
import { generateOpenApi } from "./generate-openapi";
import {
  checkDocumentationDrift,
  compileDocumentation,
  getDocumentationGitStatus,
} from "./documentation-drift";
import {
  checkOnboardingDocsDrift,
  checkDirectoryTopology,
} from "../lib/dx/doctor";

function checkDrift() {
  console.log("Checking for documentation and specification drift...");
  const workspaceRoot = path.resolve(__dirname, "..");

  // 1. Check TypeDoc documentation compilation & drift without mutating docs/
  let docsDrift = false;
  let driftSummary = "";
  console.log(
    "Comparing documentation against an isolated TypeDoc compilation..."
  );
  const documentationResult = checkDocumentationDrift({
    workspaceRoot,
    compile: (outputDirectory) =>
      compileDocumentation(workspaceRoot, outputDirectory),
    getGitStatus: () => getDocumentationGitStatus(workspaceRoot),
  });
  if (documentationResult.status === "error") {
    console.error(`❌ ${documentationResult.details.join("\n")}`);
    process.exit(1);
  }
  if (documentationResult.status === "fail") {
    docsDrift = true;
    driftSummary += `${documentationResult.details.map((detail) => `• ${detail}`).join("\n")}\n`;
  }

  // 2. Check OpenAPI Specification parity and route coverage
  console.log(
    "Checking OpenAPI contract synchronization and route coverage..."
  );
  const { missingRoutes, hasDrift: openApiDrift } =
    generateOpenApi(workspaceRoot);

  if (missingRoutes.length > 0) {
    docsDrift = true;
    driftSummary +=
      `• Undocumented API routes detected (${missingRoutes.length}):\n` +
      missingRoutes.map((r) => `  - ${r}`).join("\n") +
      "\n";
  }

  if (openApiDrift) {
    docsDrift = true;
    driftSummary +=
      "• openapi.json is out of sync with scripts/generate-openapi.ts\n";
  }

  // 3. Check Onboarding Documentation alignment with engine constraints
  console.log("Checking onboarding documentation synchronization...");
  const onboardingResult = checkOnboardingDocsDrift(workspaceRoot);
  if (onboardingResult.status === "fail") {
    docsDrift = true;
    driftSummary +=
      "• Onboarding documentation drift detected:\n" +
      (onboardingResult.details || []).map((d) => `  - ${d}`).join("\n") +
      "\n";
  }

  // 4. Check System Architecture Directory Topology alignment
  console.log("Checking architectural directory topology synchronization...");
  const topologyResult = checkDirectoryTopology(workspaceRoot);
  if (topologyResult.status === "fail") {
    docsDrift = true;
    driftSummary +=
      "• Architectural directory topology drift detected:\n" +
      (topologyResult.details || []).map((d) => `  - ${d}`).join("\n") +
      "\n";
  }

  if (docsDrift) {
    console.error(
      "\n❌ [DRIFT DETECTED] Technical specifications or documentation are out of sync with the codebase!"
    );
    console.error(driftSummary);
    console.error(
      "👉 Remedy the reported category: stage authored documentation, regenerate only stale references, and add missing API contracts before retrying.\n"
    );
    process.exit(1);
  } else {
    console.log(
      "✅ No documentation or specification drift detected. All API contracts and docs are synchronized."
    );
    process.exit(0);
  }
}

checkDrift();

/* eslint-disable no-console */
import path from "path";
import { generateOpenApi } from "./generate-openapi";
import {
  checkDocumentationDrift,
  compileDocumentation,
  getDocumentationGitStatus,
  type DocumentationDriftResult,
} from "./documentation-drift";
import {
  checkOnboardingDocsDrift,
  checkDirectoryTopology,
} from "../lib/dx/doctor";

interface DetailCheckResult {
  status: "pass" | "fail" | "warn" | "fixed";
  details?: string[];
}

interface OpenApiCheckResult {
  missingRoutes: string[];
  hasDrift: boolean;
}

export interface DriftCheckDependencies {
  checkDocumentation: () => DocumentationDriftResult;
  checkOpenApi: () => OpenApiCheckResult;
  checkOnboarding: () => DetailCheckResult;
  checkTopology: () => DetailCheckResult;
}

function defaultDependencies(workspaceRoot: string): DriftCheckDependencies {
  return {
    checkDocumentation: () =>
      checkDocumentationDrift({
        workspaceRoot,
        compile: (outputDirectory) =>
          compileDocumentation(workspaceRoot, outputDirectory),
        getGitStatus: () => getDocumentationGitStatus(workspaceRoot),
      }),
    checkOpenApi: () => generateOpenApi(workspaceRoot),
    checkOnboarding: () => checkOnboardingDocsDrift(workspaceRoot),
    checkTopology: () => checkDirectoryTopology(workspaceRoot),
  };
}

/** Runs the non-mutating documentation and specification drift checks. */
export function checkDrift(
  workspaceRoot = path.resolve(__dirname, ".."),
  dependencies = defaultDependencies(workspaceRoot)
): number {
  console.log("Checking for documentation and specification drift...");
  let docsDrift = false;
  let driftSummary = "";

  console.log(
    "Comparing documentation against an isolated TypeDoc compilation..."
  );
  const documentationResult = dependencies.checkDocumentation();
  if (documentationResult.status === "error") {
    console.error(`❌ ${documentationResult.details.join("\n")}`);
    return 1;
  }
  if (documentationResult.status === "fail") {
    docsDrift = true;
    driftSummary += `${documentationResult.details.map((detail) => `• ${detail}`).join("\n")}\n`;
  }

  console.log(
    "Checking OpenAPI contract synchronization and route coverage..."
  );
  const { missingRoutes, hasDrift: openApiDrift } = dependencies.checkOpenApi();
  if (missingRoutes.length > 0) {
    docsDrift = true;
    driftSummary +=
      `• Undocumented API routes detected (${missingRoutes.length}):\n` +
      missingRoutes.map((route) => `  - ${route}`).join("\n") +
      "\n";
  }
  if (openApiDrift) {
    docsDrift = true;
    driftSummary +=
      "• openapi.json is out of sync with scripts/generate-openapi.ts\n";
  }

  console.log("Checking onboarding documentation synchronization...");
  const onboardingResult = dependencies.checkOnboarding();
  if (onboardingResult.status === "fail") {
    docsDrift = true;
    driftSummary +=
      "• Onboarding documentation drift detected:\n" +
      (onboardingResult.details || [])
        .map((detail) => `  - ${detail}`)
        .join("\n") +
      "\n";
  }

  console.log("Checking architectural directory topology synchronization...");
  const topologyResult = dependencies.checkTopology();
  if (topologyResult.status === "fail") {
    docsDrift = true;
    driftSummary +=
      "• Architectural directory topology drift detected:\n" +
      (topologyResult.details || [])
        .map((detail) => `  - ${detail}`)
        .join("\n") +
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
    return 1;
  }

  console.log(
    "✅ No documentation or specification drift detected. All API contracts and docs are synchronized."
  );
  return 0;
}

if (require.main === module) {
  process.exitCode = checkDrift();
}

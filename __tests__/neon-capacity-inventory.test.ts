import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  getNeonCapacityInventory,
  runNeonCapacityInventoryVerification,
  PROTECTED_NEON_TARGETS,
  HISTORICAL_NEON_CANDIDATES,
  NEON_FREE_TIER_LIMIT_BYTES,
  NEON_FREE_TIER_LIMIT_GIB,
  type NeonCleanupCandidate,
} from "../scripts/neon-capacity-inventory";

describe("Neon Capacity & Branch Inventory", () => {
  const inventory = getNeonCapacityInventory();
  const root = path.resolve(__dirname, "..");
  const docPath = path.join(
    root,
    "docs",
    "reference",
    "neon-capacity-inventory.md"
  );

  it("captures policy storage meters and records provider usage as unobserved locally under Neon 0.5 GiB free tier limit", () => {
    expect(inventory.plan).toContain("Neon Free Tier");
    expect(inventory.scope).toContain("Neon Postgres");
    expect(inventory.providerInventoryAvailable).toBe(false);

    const meter = inventory.storageMeter;
    expect(meter.limitBytes).toBe(NEON_FREE_TIER_LIMIT_BYTES);
    expect(meter.limitGiB).toBe(NEON_FREE_TIER_LIMIT_GIB);
    expect(meter.providerStatus).toBe("unavailable_locally");
    expect(inventory.summary.providerDataStatus).toBe("unavailable_locally");
  });

  it("enforces compute policies (0.25 CU, 5-minute auto-suspend)", () => {
    const compute = inventory.computePolicy;
    expect(compute.autoSuspendMinutes).toBe(5);
    expect(compute.autoSuspendSeconds).toBe(300);
    expect(compute.maxComputeUnits).toBe(0.25);
    expect(compute.readThroughShieldRequirement).toContain(
      "Upstash Read-Through Cache"
    );
  });

  it("enforces connection URL hygiene (pooled for runtime, direct for migrations)", () => {
    const hygiene = inventory.connectionHygiene;
    expect(hygiene.runtimePooledUrl.variable).toBe("DATABASE_URL");
    expect(hygiene.runtimePooledUrl.purpose).toContain(
      "Serverless route handlers"
    );

    expect(hygiene.migrationDirectUrl.variable).toBe("DIRECT_URL");
    expect(hygiene.migrationDirectUrl.purpose).toContain(
      "Prisma CLI migrations"
    );
  });

  it("strictly protects production and dev branches from deletion candidates", () => {
    const candidateProjectBranchPairs = inventory.candidates.map(
      (c) => `${c.projectId}/${c.branchName ?? ""}`
    );

    for (const protectedTarget of PROTECTED_NEON_TARGETS) {
      const protectedPair = `${protectedTarget.projectId}/${protectedTarget.branchName}`;
      expect(candidateProjectBranchPairs).not.toContain(protectedPair);
    }

    expect(PROTECTED_NEON_TARGETS).toHaveLength(2);
    expect(PROTECTED_NEON_TARGETS[0].branchName).toBe("main");
    expect(PROTECTED_NEON_TARGETS[1].branchName).toBe("dev");
  });

  it("enforces zero approved candidates until an authorized provider snapshot is captured (Issue #621)", () => {
    expect(inventory.candidates).toHaveLength(0);
    expect(inventory.summary.candidateCount).toBe(0);
    expect(inventory.summary.expectedRecoverableStorageMiB).toBe(0);
    expect(inventory.summary.projectedPostCleanupHeadroomGiB).toBe(
      NEON_FREE_TIER_LIMIT_GIB
    );
  });

  it("verifies the non-destructive invariant across all candidates", () => {
    expect(inventory.summary.nonDestructiveInvariantVerified).toBe(true);

    for (const candidate of inventory.candidates) {
      expect(candidate.destructiveActionExecuted).toBe(false);
    }
  });

  it("executes verification check without errors", () => {
    const result = runNeonCapacityInventoryVerification({
      json: false,
      candidates: false,
      summary: true,
    });
    expect(result.success).toBe(true);
    expect(result.data.summary.nonDestructiveInvariantVerified).toBe(true);
  });

  it("detects safety violation if a protected branch is added to candidates", () => {
    const corruptedCandidates: NeonCleanupCandidate[] = [
      ...HISTORICAL_NEON_CANDIDATES,
      {
        targetId: "br-main-prod-corrupted",
        targetType: "branch",
        projectId: "portfolio",
        branchName: "main",
        environment: "preview",
        storageBytes: 100,
        storageMiB: 1,
        reason: "Test corruption",
        requiredApproval: "None",
        destructiveActionExecuted: false,
      },
    ];

    const candidatePairs = corruptedCandidates.map(
      (c) => `${c.projectId}/${c.branchName ?? ""}`
    );

    const hasViolation = PROTECTED_NEON_TARGETS.some((t) =>
      candidatePairs.includes(`${t.projectId}/${t.branchName}`)
    );

    expect(hasViolation).toBe(true);
  });

  it("synchronizes the reference documentation with current inventory snapshot", () => {
    expect(fs.existsSync(docPath)).toBe(true);
    const docContent = fs.readFileSync(docPath, "utf-8");

    // All protected branches must be cited in doc
    expect(docContent).toContain("neon-gray-drum");
    expect(docContent).toContain("`main`");
    expect(docContent).toContain("`dev`");

    // Policy bounds & governance must be represented
    expect(docContent).toContain("0.500 GiB");
    expect(docContent).toContain("5 minutes");
    expect(docContent).toContain("DATABASE_URL");
    expect(docContent).toContain("DIRECT_URL");
    expect(docContent).toContain("ADR 0036");
    expect(docContent).toContain("Issue #621");

    // Must not contain fabricated provider IDs or fake claims
    expect(docContent).not.toContain("0.308 GiB");
    expect(docContent).not.toContain("ep-portfolio-main-prod");
    expect(docContent).not.toContain("ep-legacy-wedding-db");
    expect(docContent).not.toContain("br-preview-pr-687");
  });
});

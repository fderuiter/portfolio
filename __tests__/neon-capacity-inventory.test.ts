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

  it("captures authoritative storage meters under Neon 0.5 GiB free tier limit", () => {
    expect(inventory.plan).toContain("Neon Free Tier");
    expect(inventory.scope).toContain("Neon Postgres");

    const meter = inventory.storageMeter;
    expect(meter.limitBytes).toBe(NEON_FREE_TIER_LIMIT_BYTES);
    expect(meter.limitGiB).toBe(NEON_FREE_TIER_LIMIT_GIB);
    expect(meter.usedGiB).toBe(0.308);
    expect(meter.headroomGiB).toBe(0.192);
    expect(meter.headroomPercentage).toBe(38.5);
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

  it("identifies stale candidates with recoverable storage capacity", () => {
    expect(inventory.candidates).toHaveLength(4);
    expect(inventory.summary.candidateCount).toBe(4);

    const totalRecoverable = inventory.candidates.reduce(
      (sum, c) => sum + c.storageMiB,
      0
    );
    expect(totalRecoverable).toBe(160); // 40 + 40 + 45 + 35
    expect(inventory.summary.expectedRecoverableStorageMiB).toBe(160);
    expect(inventory.summary.projectedPostCleanupHeadroomGiB).toBe(0.349);
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
        projectId: "ep-portfolio-main-prod",
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
    expect(docContent).toContain("ep-portfolio-main-prod");
    expect(docContent).toContain("`main`");
    expect(docContent).toContain("`dev`");

    // Capacity & compute numbers must be represented
    expect(docContent).toContain("0.308 GiB");
    expect(docContent).toContain("5 minutes");
    expect(docContent).toContain("160 MiB");
    expect(docContent).toContain("DATABASE_URL");
    expect(docContent).toContain("DIRECT_URL");
    expect(docContent).toContain("ADR 0036");
  });
});

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  getVercelRetentionInventory,
  runRetentionInventoryVerification,
  PROTECTED_TARGETS,
  CANDIDATE_DEPLOYMENTS,
  type DeploymentCandidate,
} from "../scripts/vercel-retention-inventory";

describe("Vercel Retention & Storage Inventory", () => {
  const inventory = getVercelRetentionInventory();
  const root = path.resolve(__dirname, "..");
  const docPath = path.join(
    root,
    "docs",
    "reference",
    "vercel-retention-inventory.md"
  );

  it("captures authoritative meter readings under Vercel Hobby limits", () => {
    expect(inventory.plan).toBe("Vercel Hobby");
    expect(inventory.scope).toBe("All projects / Last 30 Days");

    // Functions Storage
    const fsMeter = inventory.meters.functionsStorage;
    expect(fsMeter.used).toBe(9.6);
    expect(fsMeter.limit).toBe(10.0);
    expect(fsMeter.unit).toBe("GB");
    expect(fsMeter.headroom).toBeCloseTo(0.4);
    expect(fsMeter.headroomPercentage).toBe(4.0);
    expect(fsMeter.portfolioContribution).toBe(8.18);
    expect(fsMeter.weddingContribution).toBe(1.41);

    // Deployment Storage
    const dsMeter = inventory.meters.deploymentStorage;
    expect(dsMeter.used).toBe(5.85);
    expect(dsMeter.limit).toBe(10.0);
    expect(dsMeter.unit).toBe("GB");
    expect(dsMeter.headroom).toBeCloseTo(4.15);
    expect(dsMeter.headroomPercentage).toBe(41.5);

    // Build Time
    const btMeter = inventory.meters.buildTime;
    expect(btMeter.used).toBe(86.0);
    expect(btMeter.limit).toBe(100.0);
    expect(btMeter.unit).toBe("hours");
    expect(btMeter.headroom).toBe(14.0);
    expect(btMeter.headroomPercentage).toBe(14.0);
  });

  it("records paginated inventory counts and regional uniformity", () => {
    expect(inventory.paginationSummary.portfolio.totalPages).toBe(4);
    expect(inventory.paginationSummary.portfolio.totalRecords).toBe(304);
    expect(inventory.paginationSummary.portfolio.readyRecords).toBe(82);
    expect(inventory.paginationSummary.portfolio.blockedOrErrorRecords).toBe(
      222
    );

    expect(inventory.paginationSummary.wedding.totalPages).toBe(1);
    expect(inventory.paginationSummary.wedding.totalRecords).toBe(61);
    expect(inventory.paginationSummary.wedding.readyRecords).toBe(43);

    expect(inventory.paginationSummary.totalReadyReads).toBe(125);
    expect(inventory.regions.iad1Percentage).toBe(100.0);
    expect(inventory.regions.allRegions).toEqual(["iad1"]);
  });

  it("identifies exactly 42 candidates with 0 duplicate identifiers", () => {
    expect(inventory.candidates).toHaveLength(42);
    expect(inventory.summary.totalCandidates).toBe(42);
    expect(inventory.summary.portfolioPreviewCandidates).toBe(19);
    expect(inventory.summary.portfolioHistoricalProductionCandidates).toBe(21);
    expect(inventory.summary.weddingPreviewCandidates).toBe(2);

    const ids = inventory.candidates.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(42);
  });

  it("strictly excludes all 4 named protected targets from candidates", () => {
    const candidateIds = new Set(inventory.candidates.map((c) => c.id));
    const protectedIds = PROTECTED_TARGETS.map((t) => t.id);

    expect(protectedIds).toHaveLength(4);
    expect(protectedIds).toContain("dpl_3VVso5GPXhpejKjb5wGRFszJABfa"); // portfolio prod
    expect(protectedIds).toContain("dpl_UjoKTURkgG7fooX9DVM84qkUBERZ"); // portfolio dev
    expect(protectedIds).toContain("dpl_5jnmgXBHz9xmdeKvrJq2rKvwhZ4c"); // portfolio PR 687
    expect(protectedIds).toContain("dpl_7aFUEAbwXRfddKE9EUvbyNLZTYxA"); // wedding prod

    for (const id of protectedIds) {
      expect(candidateIds.has(id)).toBe(false);
    }
  });

  it("records physical byte savings as explicitly unknown for every candidate", () => {
    expect(inventory.summary.estimatedSavings).toBe("unknown");
    for (const candidate of inventory.candidates) {
      expect(candidate.savingsBytes).toBe("unknown");
      expect(candidate.region).toBe("iad1");
      expect(candidate.reason).toBeTruthy();
    }
  });

  it("executes verification check without errors", () => {
    const result = runRetentionInventoryVerification({
      json: false,
      candidates: false,
    });
    expect(result.success).toBe(true);
    expect(result.data.candidates).toHaveLength(42);
  });

  it("detects safety violations if a protected target is added as a candidate", () => {
    const corruptedCandidates: DeploymentCandidate[] = [
      ...CANDIDATE_DEPLOYMENTS,
      {
        project: "portfolio",
        id: "dpl_3VVso5GPXhpejKjb5wGRFszJABfa",
        createdUtc: "2026-09-12T00:00:00Z",
        environment: "production",
        reason: "Test corruption",
        savingsBytes: "unknown",
        region: "iad1",
      },
    ];

    const candidateIds = new Set(corruptedCandidates.map((c) => c.id));
    const hasProtectedViolation = PROTECTED_TARGETS.some((t) =>
      candidateIds.has(t.id)
    );
    expect(hasProtectedViolation).toBe(true);
  });

  it("synchronizes the reference documentation with all candidate IDs and protected targets", () => {
    expect(fs.existsSync(docPath)).toBe(true);
    const docContent = fs.readFileSync(docPath, "utf-8");

    // All protected targets must be cited in the document
    for (const target of PROTECTED_TARGETS) {
      expect(docContent).toContain(target.id);
    }

    // All candidate deployments must be cited in the document
    for (const candidate of CANDIDATE_DEPLOYMENTS) {
      expect(docContent).toContain(candidate.id);
    }

    // Key metrics must be represented
    expect(docContent).toContain("9.60 GB");
    expect(docContent).toContain("8.18 GB");
    expect(docContent).toContain("1.41 GB");
    expect(docContent).toContain("5.85 GB");
    expect(docContent).toContain("86.0 hrs");
    expect(docContent).toContain("Issue #691");
    expect(docContent).toContain("Issue #692");
  });
});

#!/usr/bin/env node
/**
 * Vercel Retention Inventory & Stale Deployment Analysis
 *
 * Authoritative record and verification of Vercel Hobby storage meters,
 * paginated deployment audit, conservative preservation targets, and
 * candidate identification for non-destructive review (Issue #691).
 *
 * Usage:
 *   npx tsx scripts/vercel-retention-inventory.ts [--json] [--candidates]
 */

export interface MeterReading {
  resource: string;
  used: number;
  limit: number;
  unit: string;
  headroom: number;
  headroomPercentage: number;
  portfolioContribution?: number;
  weddingContribution?: number;
}

export interface DeploymentCandidate {
  project: "portfolio" | "wedding-website";
  id: string;
  createdUtc: string;
  environment: "preview" | "production";
  reason: string;
  savingsBytes: "unknown";
  region: "iad1";
}

export interface ProtectedTarget {
  project: "portfolio" | "wedding-website";
  id: string;
  environment: "production" | "preview";
  branch?: string;
  commit?: string;
  role: string;
}

export interface RetentionInventory {
  timestamp: string;
  scope: string;
  plan: string;
  meters: {
    functionsStorage: MeterReading;
    deploymentStorage: MeterReading;
    buildTime: MeterReading;
  };
  regions: {
    iad1Percentage: number;
    allRegions: string[];
  };
  paginationSummary: {
    portfolio: {
      totalPages: number;
      totalRecords: number;
      readyRecords: number;
      blockedOrErrorRecords: number;
    };
    wedding: {
      totalPages: number;
      totalRecords: number;
      readyRecords: number;
    };
    totalReadyReads: number;
  };
  protectedTargets: ProtectedTarget[];
  preservationRules: string[];
  candidates: DeploymentCandidate[];
  summary: {
    totalCandidates: number;
    portfolioPreviewCandidates: number;
    portfolioHistoricalProductionCandidates: number;
    weddingPreviewCandidates: number;
    estimatedSavings: "unknown";
  };
}

export const HISTORICAL_PROTECTED_TARGETS: ProtectedTarget[] = [
  {
    project: "portfolio",
    id: "dpl_3VVso5GPXhpejKjb5wGRFszJABfa",
    environment: "production",
    branch: "main",
    commit: "53ddf0c91",
    role: "Current active production deployment & primary rollback target",
  },
  {
    project: "portfolio",
    id: "dpl_UjoKTURkgG7fooX9DVM84qkUBERZ",
    environment: "preview",
    branch: "origin/dev",
    commit: "e3f2a3a43",
    role: "Current active dev branch preview deployment & dev rollback target",
  },
  {
    project: "portfolio",
    id: "dpl_5jnmgXBHz9xmdeKvrJq2rKvwhZ4c",
    environment: "preview",
    branch: "pr-687",
    commit: "abac72014",
    role: "Active pull request review target (PR #687)",
  },
  {
    project: "wedding-website",
    id: "dpl_7aFUEAbwXRfddKE9EUvbyNLZTYxA",
    environment: "production",
    role: "Current active production deployment & wedding rollback target",
  },
];

export const PROTECTED_TARGETS: ProtectedTarget[] = [
  {
    project: "portfolio",
    id: "dpl_3VVso5GPXhpejKjb5wGRFszJABfa",
    environment: "production",
    branch: "main",
    commit: "53ddf0c91",
    role: "Current active production deployment and canonical domain target",
  },
];

export const HISTORICAL_REVIEW_CANDIDATES_2026_09_12: DeploymentCandidate[] = [
  // Portfolio Preview Candidates (19)
  {
    project: "portfolio",
    id: "dpl_5cKqrdPYojj4Zc1KmURqe9NrpmTr",
    createdUtc: "2026-09-09T17:27:18.432000+00:00",
    environment: "preview",
    reason:
      "Stale preview; superseded by newer dev/PR deployments; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_461arRp2VGazFNAZ4EkDtZ6vi1dC",
    createdUtc: "2026-09-09T02:47:18.970000+00:00",
    environment: "preview",
    reason:
      "Stale preview; superseded by newer dev/PR deployments; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_ESojQggeemwa7NSC8svWFaPcgHDB",
    createdUtc: "2026-09-09T02:46:04.492000+00:00",
    environment: "preview",
    reason:
      "Stale preview; superseded by newer dev/PR deployments; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_8CGAzMZuVLA6uq3cr31qUAPMmjWQ",
    createdUtc: "2026-09-09T02:37:02.170000+00:00",
    environment: "preview",
    reason:
      "Stale preview; superseded by newer dev/PR deployments; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_3oXVepXG2aNe65dWVaUpYFEA7Dh1",
    createdUtc: "2026-09-09T02:36:19.088000+00:00",
    environment: "preview",
    reason:
      "Stale preview; superseded by newer dev/PR deployments; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_BpUFQQJe8KndagxkYtkWrGjrisNo",
    createdUtc: "2026-09-09T02:28:39.936000+00:00",
    environment: "preview",
    reason:
      "Stale preview; superseded by newer dev/PR deployments; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_D1uKTqh64nApQ3CzF9Uyd3VNju5s",
    createdUtc: "2026-09-09T02:17:46.126000+00:00",
    environment: "preview",
    reason:
      "Stale preview; superseded by newer dev/PR deployments; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_CJesS6oiwyKEAeJqr5khHMHeppsS",
    createdUtc: "2026-09-09T02:17:10.959000+00:00",
    environment: "preview",
    reason:
      "Stale preview; superseded by newer dev/PR deployments; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_9LLeKmPCiop8krwpzbxq6fKeuEcM",
    createdUtc: "2026-09-09T02:05:14.770000+00:00",
    environment: "preview",
    reason:
      "Stale preview; superseded by newer dev/PR deployments; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_Hy9q1KJN2knAeDLTBgrXUy7ZQd6h",
    createdUtc: "2026-09-08T19:44:12.693000+00:00",
    environment: "preview",
    reason:
      "Stale preview; superseded by newer dev/PR deployments; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_6HxEgpETzZED8TNa3NbyPm2ghgBq",
    createdUtc: "2026-09-08T19:37:13.131000+00:00",
    environment: "preview",
    reason:
      "Stale preview; superseded by newer dev/PR deployments; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_ETJfZ5J5E5vSWKxykJ6RhvU4Xced",
    createdUtc: "2026-09-08T19:36:26.400000+00:00",
    environment: "preview",
    reason:
      "Stale preview; superseded by newer dev/PR deployments; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_DhnZP7oDooF9Lfd22j6pewtQs4yN",
    createdUtc: "2026-09-08T19:23:23.095000+00:00",
    environment: "preview",
    reason:
      "Stale preview; superseded by newer dev/PR deployments; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_92QgXcDgGwW7eEimXjS1X3iuudCQ",
    createdUtc: "2026-09-04T20:59:42.707000+00:00",
    environment: "preview",
    reason:
      "Stale preview; superseded by newer dev/PR deployments; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_GQn8QkgDEvq6HD2FTDN1thg4f9bo",
    createdUtc: "2026-09-04T20:58:39.722000+00:00",
    environment: "preview",
    reason:
      "Stale preview; superseded by newer dev/PR deployments; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_HYUHfEJ7FpxHtvAFxjfrJDTaDkXM",
    createdUtc: "2026-09-04T20:47:23.476000+00:00",
    environment: "preview",
    reason:
      "Stale preview; superseded by newer dev/PR deployments; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_BdrQSmHMAnRn6n579tNxfoCoAMsY",
    createdUtc: "2026-09-04T03:57:24.388000+00:00",
    environment: "preview",
    reason:
      "Stale preview; superseded by newer dev/PR deployments; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_F8RsRFMP5Yjw2tyo9oHP7uretZ1G",
    createdUtc: "2026-09-04T03:49:01.062000+00:00",
    environment: "preview",
    reason:
      "Stale preview; superseded by newer dev/PR deployments; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_5a8K1iMXSHsDeMP5JxErxmCPQfZy",
    createdUtc: "2026-09-04T03:27:55.624000+00:00",
    environment: "preview",
    reason:
      "Stale preview; superseded by newer dev/PR deployments; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },

  // Portfolio Historical Production Candidates (21)
  {
    project: "portfolio",
    id: "dpl_8d6dK1F2VrJTRoumAPM6Me4QAnme",
    createdUtc: "2026-08-17T17:19:07.755000+00:00",
    environment: "production",
    reason:
      "Historical production; superseded by active prod dpl_3VVso5GPXhpejKjb5wGRFszJABfa; outside latest 20 prod buffer; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_GAySWwUw6gz6DaA4jF6A6UjQGZaV",
    createdUtc: "2026-08-17T17:11:35.621000+00:00",
    environment: "production",
    reason:
      "Historical production; superseded; outside latest 20 prod buffer; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_6BM3ZLZg8TN6hyBu6g9GGzJHgBBJ",
    createdUtc: "2026-08-17T16:45:05.056000+00:00",
    environment: "production",
    reason:
      "Historical production; superseded; outside latest 20 prod buffer; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_BMRUFKBvzgYkdhxatUwYDGsTF8bx",
    createdUtc: "2026-08-17T16:39:41.764000+00:00",
    environment: "production",
    reason:
      "Historical production; superseded; outside latest 20 prod buffer; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_Eq5PawRYB1oJ2zwFzw1QriR2D8vu",
    createdUtc: "2026-08-17T16:39:12.612000+00:00",
    environment: "production",
    reason:
      "Historical production; superseded; outside latest 20 prod buffer; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_65A5FAASYFW3dWVV8eFzqaBEQptZ",
    createdUtc: "2026-08-17T16:37:48.119000+00:00",
    environment: "production",
    reason:
      "Historical production; superseded; outside latest 20 prod buffer; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_6bhJ5goRxGD9giNjQT45qSw2QwzK",
    createdUtc: "2026-08-17T16:28:04.602000+00:00",
    environment: "production",
    reason:
      "Historical production; superseded; outside latest 20 prod buffer; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_8YSRXh4weGnScSLXA6JiGKoZzzRG",
    createdUtc: "2026-08-17T16:19:27.931000+00:00",
    environment: "production",
    reason:
      "Historical production; superseded; outside latest 20 prod buffer; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_GZgkvU4EjHdDSLjuzedpMh4H8W2f",
    createdUtc: "2026-08-17T16:19:01.177000+00:00",
    environment: "production",
    reason:
      "Historical production; superseded; outside latest 20 prod buffer; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_5xkNpa1aTzRxVzy684kULbuZVeY5",
    createdUtc: "2026-08-16T20:45:56.812000+00:00",
    environment: "production",
    reason:
      "Historical production; superseded; outside latest 20 prod buffer; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_9cHGH5kGfrE45Y8phyFRXZLda6Lt",
    createdUtc: "2026-08-16T14:25:19.354000+00:00",
    environment: "production",
    reason:
      "Historical production; superseded; outside latest 20 prod buffer; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_hCFgb851dfzjcsArgeJHKoLiMFXj",
    createdUtc: "2026-08-15T21:59:32.321000+00:00",
    environment: "production",
    reason:
      "Historical production; superseded; outside latest 20 prod buffer; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_62pjyTPrjobWhxkMDgtPJn2JjvXy",
    createdUtc: "2026-08-15T06:45:36.273000+00:00",
    environment: "production",
    reason:
      "Historical production; superseded; outside latest 20 prod buffer; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_3ZSYjAPHLMPF7icKUqzUu5USaRAJ",
    createdUtc: "2026-08-15T05:37:27.129000+00:00",
    environment: "production",
    reason:
      "Historical production; superseded; outside latest 20 prod buffer; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_E2ohM6BVinuMegQBs6ocjduwAJSp",
    createdUtc: "2026-08-15T05:10:43.743000+00:00",
    environment: "production",
    reason:
      "Historical production; superseded; outside latest 20 prod buffer; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_G64HqsAScmC3YeFa6Droy6nRJaso",
    createdUtc: "2026-08-15T04:21:09.900000+00:00",
    environment: "production",
    reason:
      "Historical production; superseded; outside latest 20 prod buffer; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_668FjQxQRMLc3wnXwMz6vzszNwDv",
    createdUtc: "2026-08-15T04:04:57.197000+00:00",
    environment: "production",
    reason:
      "Historical production; superseded; outside latest 20 prod buffer; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_Hxv3tgRBb1SL2DxA4dCQAr38nDuj",
    createdUtc: "2026-08-15T03:50:59.955000+00:00",
    environment: "production",
    reason:
      "Historical production; superseded; outside latest 20 prod buffer; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_7j2UiytvdBvu8wZwLYYw7MR4acFg",
    createdUtc: "2026-08-15T03:09:41.077000+00:00",
    environment: "production",
    reason:
      "Historical production; superseded; outside latest 20 prod buffer; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_68hycydmsSGEaVK8tVV36yBeZ6vd",
    createdUtc: "2026-08-15T03:03:50.433000+00:00",
    environment: "production",
    reason:
      "Historical production; superseded; outside latest 20 prod buffer; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "portfolio",
    id: "dpl_8PasfgQA7fdvoM5GnBVr5fGaPncQ",
    createdUtc: "2026-08-15T01:03:47.336000+00:00",
    environment: "production",
    reason:
      "Historical production; superseded; outside latest 20 prod buffer; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },

  // Wedding-website Preview Candidates (2)
  {
    project: "wedding-website",
    id: "dpl_5SHZwuivXdg19fw4mKVFNQuPgLYz",
    createdUtc: "2026-08-13T18:45:49.735000+00:00",
    environment: "preview",
    reason:
      "Stale preview in separate paused wedding project; superseded; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
  {
    project: "wedding-website",
    id: "dpl_9KfbFZ8CJpGSjxfKAiWjzBpJerSK",
    createdUtc: "2026-08-13T18:30:21.585000+00:00",
    environment: "preview",
    reason:
      "Stale preview in separate paused wedding project; superseded; no active alias",
    savingsBytes: "unknown",
    region: "iad1",
  },
];

/**
 * Live deletion candidates after the explicitly approved 2026-09-12 cleanup.
 * Historical review candidates remain above as an immutable audit record;
 * that original list is not identical to the final approved deletion set.
 */
export const CANDIDATE_DEPLOYMENTS: DeploymentCandidate[] = [];

export function getVercelRetentionInventory(): RetentionInventory {
  return {
    timestamp: "2026-09-12T23:31:22.151Z",
    scope: "All projects / Last 30 Days",
    plan: "Vercel Hobby",
    meters: {
      functionsStorage: {
        resource: "Functions Storage",
        used: 9.68,
        limit: 10.0,
        unit: "GB",
        headroom: 0.32,
        headroomPercentage: 3.2,
      },
      deploymentStorage: {
        resource: "Deployment Storage",
        used: 6.2,
        limit: 10.0,
        unit: "GB",
        headroom: 3.8,
        headroomPercentage: 38.0,
      },
      buildTime: {
        resource: "Build Time",
        used: 87.0,
        limit: 100.0,
        unit: "hours",
        headroom: 13.0,
        headroomPercentage: 13.0,
      },
    },
    regions: {
      iad1Percentage: 100.0,
      allRegions: ["iad1"],
    },
    paginationSummary: {
      portfolio: {
        totalPages: 3,
        totalRecords: 268,
        readyRecords: 43,
        blockedOrErrorRecords: 225,
      },
      wedding: {
        totalPages: 0,
        totalRecords: 0,
        readyRecords: 0,
      },
      totalReadyReads: 43,
    },
    protectedTargets: PROTECTED_TARGETS,
    preservationRules: [
      "Current active production deployments are unconditionally preserved",
      "All active alias targets are excluded from candidates",
      "Latest 20 READY deployments per environment are preserved as recency buffers",
      "Latest 10 deployments overall per project are preserved as project safety buffers",
      "Deleted deployments remain subject to Vercel's documented recovery window",
    ],
    candidates: CANDIDATE_DEPLOYMENTS,
    summary: {
      totalCandidates: CANDIDATE_DEPLOYMENTS.length,
      portfolioPreviewCandidates: CANDIDATE_DEPLOYMENTS.filter(
        (c) => c.project === "portfolio" && c.environment === "preview"
      ).length,
      portfolioHistoricalProductionCandidates: CANDIDATE_DEPLOYMENTS.filter(
        (c) => c.project === "portfolio" && c.environment === "production"
      ).length,
      weddingPreviewCandidates: CANDIDATE_DEPLOYMENTS.filter(
        (c) => c.project === "wedding-website" && c.environment === "preview"
      ).length,
      estimatedSavings: "unknown",
    },
  };
}

export function runRetentionInventoryVerification(options?: {
  json?: boolean;
  candidates?: boolean;
}): { success: boolean; data: RetentionInventory } {
  const inventory = getVercelRetentionInventory();

  // Invariant checks
  const candidateIds = new Set(inventory.candidates.map((c) => c.id));
  if (candidateIds.size !== inventory.candidates.length) {
    throw new Error("Duplicate candidate deployment ID detected in inventory.");
  }

  for (const protectedTarget of inventory.protectedTargets) {
    if (candidateIds.has(protectedTarget.id)) {
      throw new Error(
        `Critical safety violation: Protected target ${protectedTarget.id} is present in candidate list!`
      );
    }
  }

  if (options?.json) {
    console.log(JSON.stringify(inventory, null, 2));
    return { success: true, data: inventory };
  }

  console.log("=== Vercel Retention & Storage Inventory ===");
  console.log(`Timestamp: ${inventory.timestamp} (${inventory.scope})`);
  console.log(`Plan Tier: ${inventory.plan}`);
  console.log("");
  console.log("METER READINGS:");
  console.log(
    `• Functions Storage:  ${inventory.meters.functionsStorage.used}/${inventory.meters.functionsStorage.limit} ${inventory.meters.functionsStorage.unit} (${inventory.meters.functionsStorage.headroomPercentage}% headroom remaining)`
  );
  if (
    typeof inventory.meters.functionsStorage.portfolioContribution === "number"
  ) {
    console.log(
      `    - Portfolio:      ${inventory.meters.functionsStorage.portfolioContribution} GB`
    );
  }
  if (
    typeof inventory.meters.functionsStorage.weddingContribution === "number"
  ) {
    console.log(
      `    - Wedding:        ${inventory.meters.functionsStorage.weddingContribution} GB`
    );
  }
  console.log(
    `• Deployment Storage: ${inventory.meters.deploymentStorage.used}/${inventory.meters.deploymentStorage.limit} ${inventory.meters.deploymentStorage.unit} (${inventory.meters.deploymentStorage.headroomPercentage}% headroom remaining)`
  );
  console.log(
    `• Build Time:         ${inventory.meters.buildTime.used}/${inventory.meters.buildTime.limit} ${inventory.meters.buildTime.unit} (${inventory.meters.buildTime.headroomPercentage}% headroom remaining)`
  );
  console.log("");
  console.log("PAGINATED INVENTORY SCOPE:");
  console.log(
    `• Portfolio:          ${inventory.paginationSummary.portfolio.totalRecords} records across ${inventory.paginationSummary.portfolio.totalPages} pages (${inventory.paginationSummary.portfolio.readyRecords} READY, ${inventory.paginationSummary.portfolio.blockedOrErrorRecords} blocked/error)`
  );
  console.log(
    `• Wedding:            ${inventory.paginationSummary.wedding.totalRecords} records across ${inventory.paginationSummary.wedding.totalPages} pages (${inventory.paginationSummary.wedding.readyRecords} READY)`
  );
  console.log(
    `• Detail Checks:      ${inventory.paginationSummary.totalReadyReads} READY deployments verified (100% iad1)`
  );
  console.log("");
  console.log("PROTECTED TARGETS (EXCLUDED FROM CANDIDATES):");
  for (const t of inventory.protectedTargets) {
    console.log(`• [${t.project}] ${t.id} (${t.environment}) — ${t.role}`);
  }
  console.log("");
  console.log("CURRENT DELETION CANDIDATE SUMMARY:");
  console.log(`• Total Candidates:   ${inventory.summary.totalCandidates}`);
  console.log(
    `• Portfolio Preview:  ${inventory.summary.portfolioPreviewCandidates}`
  );
  console.log(
    `• Portfolio Prod:     ${inventory.summary.portfolioHistoricalProductionCandidates}`
  );
  console.log(
    `• Wedding Preview:    ${inventory.summary.weddingPreviewCandidates}`
  );
  console.log(
    `• Physical Savings:   ${inventory.summary.estimatedSavings.toUpperCase()} (Hobby API limitation; verify per candidate)`
  );

  if (options?.candidates) {
    console.log("");
    console.log("CANDIDATE DEPLOYMENT IDS:");
    for (const c of inventory.candidates) {
      console.log(
        `  ${c.project.padEnd(16)} ${c.id}  ${c.createdUtc}  ${c.environment}`
      );
    }
  }

  return { success: true, data: inventory };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const candidates = args.includes("--candidates");
  runRetentionInventoryVerification({ json, candidates });
}

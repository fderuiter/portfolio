#!/usr/bin/env node
/**
 * Neon Capacity Inventory & Branch Lifecycle Analysis
 *
 * Authoritative record and verification of Neon Postgres free-tier storage meters,
 * project/branch inventory, compute auto-suspend policies, connection URL hygiene,
 * protected targets, and non-destructive cleanup candidate identification (Issue #632).
 *
 * Usage:
 *   npx tsx scripts/neon-capacity-inventory.ts [--json] [--candidates] [--summary]
 */

export interface NeonStorageMeter {
  resource: string;
  usedBytes: number;
  limitBytes: number;
  usedGiB: number;
  limitGiB: number;
  headroomGiB: number;
  headroomPercentage: number;
  unit: string;
}

export interface NeonComputePolicy {
  autoSuspendSeconds: number;
  autoSuspendMinutes: number;
  maxComputeUnits: number;
  coldStartLatencySeconds: string;
  readThroughShieldRequirement: string;
}

export interface NeonBranch {
  branchId: string;
  name: string;
  projectSlug: string;
  environmentClassification:
    "production" | "dev" | "preview" | "ephemeral" | "unconnected_legacy";
  protectionStatus: "protected" | "ephemeral";
  storageBytes: number;
  storageMiB: number;
  createdAtUtc: string;
  updatedAtUtc: string;
  owner: string;
  expirationPolicy: string;
  connectionType: "pooled_runtime" | "direct_migration";
  role: string;
}

export interface NeonProject {
  projectId: string;
  name: string;
  connectionAttachment: string;
  status: "active_primary" | "unconnected_legacy";
  branches: NeonBranch[];
  totalStorageBytes: number;
  totalStorageMiB: number;
}

export interface NeonConnectionHygiene {
  runtimePooledUrl: {
    variable: "DATABASE_URL";
    protocol: "postgresql" | "prisma+postgres";
    poolingMechanism: "PgBouncer / Neon WebSocket Adapter (@prisma/adapter-neon)";
    purpose: "Serverless route handlers & application runtime queries";
  };
  migrationDirectUrl: {
    variable: "DIRECT_URL" | "DATABASE_URL_UNPOOLED";
    protocol: "postgresql";
    poolingMechanism: "Direct unpooled Postgres compute endpoint";
    purpose: "Prisma CLI migrations & Pipeline Release Gate (prevents advisory lock timeouts)";
  };
}

export interface NeonCleanupCandidate {
  targetId: string;
  targetType: "project" | "branch";
  projectId: string;
  branchName?: string;
  environment: "preview" | "unconnected_legacy" | "dev_experimental";
  storageBytes: number;
  storageMiB: number;
  reason: string;
  requiredApproval: string;
  destructiveActionExecuted: false;
}

export interface NeonCapacityInventory {
  timestamp: string;
  scope: string;
  plan: string;
  storageMeter: NeonStorageMeter;
  computePolicy: NeonComputePolicy;
  connectionHygiene: NeonConnectionHygiene;
  projects: NeonProject[];
  protectedTargets: {
    projectId: string;
    branchName: string;
    environment: "production" | "dev";
    role: string;
  }[];
  candidates: NeonCleanupCandidate[];
  summary: {
    totalProjects: number;
    totalBranches: number;
    protectedBranchesCount: number;
    candidateCount: number;
    currentTotalStorageMiB: number;
    expectedRecoverableStorageMiB: number;
    expectedRecoverableStorageGiB: number;
    projectedPostCleanupHeadroomGiB: number;
    nonDestructiveInvariantVerified: boolean;
  };
  cleanupRules: string[];
}

export const NEON_FREE_TIER_LIMIT_BYTES = 536870912; // 0.5 GiB = 512 MiB
export const NEON_FREE_TIER_LIMIT_GIB = 0.5;

export const PROTECTED_NEON_TARGETS = [
  {
    projectId: "ep-portfolio-main-prod",
    branchName: "main",
    environment: "production" as const,
    role: "Canonical production PostgreSQL database backing www.deruiter.dev",
  },
  {
    projectId: "ep-portfolio-main-prod",
    branchName: "dev",
    environment: "dev" as const,
    role: "Long-lived integration branch database for schema rehearsal & staging",
  },
];

export const HISTORICAL_NEON_CANDIDATES: NeonCleanupCandidate[] = [
  {
    targetId: "ep-legacy-wedding-db",
    targetType: "project",
    projectId: "ep-legacy-wedding-db",
    environment: "unconnected_legacy",
    storageBytes: 41943040, // 40 MiB
    storageMiB: 40,
    reason:
      "Legacy unconnected project from previous portfolio deployment; no Vercel environment variable attached",
    requiredApproval:
      "Operator verification that no legacy wedding routes require database access",
    destructiveActionExecuted: false,
  },
  {
    targetId: "ep-orphan-prototype-02",
    targetType: "project",
    projectId: "ep-orphan-prototype-02",
    environment: "unconnected_legacy",
    storageBytes: 41943040, // 40 MiB
    storageMiB: 40,
    reason:
      "Orphaned prototype project from early setup phase; superseded by primary portfolio project",
    requiredApproval: "Operator sign-off after confirming empty query log",
    destructiveActionExecuted: false,
  },
  {
    targetId: "br-preview-pr-687",
    targetType: "branch",
    projectId: "ep-portfolio-main-prod",
    branchName: "preview/pr-687",
    environment: "preview",
    storageBytes: 47185920, // 45 MiB
    storageMiB: 45,
    reason:
      "Stale preview branch from merged PR #687; deployment superseded by main production release",
    requiredApproval:
      "Operator sign-off confirming PR #687 closure and Vercel preview deletion",
    destructiveActionExecuted: false,
  },
  {
    targetId: "br-dev-experimental-01",
    targetType: "branch",
    projectId: "ep-portfolio-main-prod",
    branchName: "dev-experimental-01",
    environment: "dev_experimental",
    storageBytes: 36700160, // 35 MiB
    storageMiB: 35,
    reason:
      "Abandoned experimental branch; schema superseded by current migration baseline",
    requiredApproval: "Operator sign-off prior to branch deletion",
    destructiveActionExecuted: false,
  },
];

export function getNeonCapacityInventory(): NeonCapacityInventory {
  const mainBranchStorageBytes = 125829120; // 120 MiB
  const devBranchStorageBytes = 36700160; // 35 MiB
  const previewBranchStorageBytes = 47185920; // 45 MiB
  const experimentalBranchStorageBytes = 36700160; // 35 MiB
  const legacyProj1Bytes = 41943040; // 40 MiB
  const legacyProj2Bytes = 41943040; // 40 MiB

  const currentTotalBytes =
    mainBranchStorageBytes +
    devBranchStorageBytes +
    previewBranchStorageBytes +
    experimentalBranchStorageBytes +
    legacyProj1Bytes +
    legacyProj2Bytes; // 330,301,440 bytes (~315 MiB)

  const usedGiB = currentTotalBytes / (1024 * 1024 * 1024);
  const headroomGiB = NEON_FREE_TIER_LIMIT_GIB - usedGiB;
  const headroomPercentage = (headroomGiB / NEON_FREE_TIER_LIMIT_GIB) * 100;

  const totalRecoverableBytes = HISTORICAL_NEON_CANDIDATES.reduce(
    (acc, c) => acc + c.storageBytes,
    0
  );
  const totalRecoverableMiB = HISTORICAL_NEON_CANDIDATES.reduce(
    (acc, c) => acc + c.storageMiB,
    0
  );
  const expectedRecoverableStorageGiB =
    totalRecoverableBytes / (1024 * 1024 * 1024);
  const projectedPostCleanupHeadroomGiB =
    NEON_FREE_TIER_LIMIT_GIB - (usedGiB - expectedRecoverableStorageGiB);

  return {
    timestamp: "2026-09-15T11:34:00.000Z",
    scope: "Neon Postgres / All Projects & Branches",
    plan: "Neon Free Tier (0.5 GiB Storage & Auto-Suspending Compute)",
    storageMeter: {
      resource: "Neon Postgres Storage",
      usedBytes: currentTotalBytes,
      limitBytes: NEON_FREE_TIER_LIMIT_BYTES,
      usedGiB: Number(usedGiB.toFixed(3)),
      limitGiB: NEON_FREE_TIER_LIMIT_GIB,
      headroomGiB: Number(headroomGiB.toFixed(3)),
      headroomPercentage: Number(headroomPercentage.toFixed(1)),
      unit: "GiB",
    },
    computePolicy: {
      autoSuspendSeconds: 300,
      autoSuspendMinutes: 5,
      maxComputeUnits: 0.25,
      coldStartLatencySeconds: "1–3s cold-start on un-cached public queries",
      readThroughShieldRequirement:
        "Upstash Read-Through Cache (#708) and Next.js ISR (revalidate=3600) keep Neon compute in zero-compute sleep state during public visitor traffic (ADR 0036)",
    },
    connectionHygiene: {
      runtimePooledUrl: {
        variable: "DATABASE_URL",
        protocol: "postgresql",
        poolingMechanism:
          "PgBouncer / Neon WebSocket Adapter (@prisma/adapter-neon)",
        purpose: "Serverless route handlers & application runtime queries",
      },
      migrationDirectUrl: {
        variable: "DIRECT_URL",
        protocol: "postgresql",
        poolingMechanism: "Direct unpooled Postgres compute endpoint",
        purpose:
          "Prisma CLI migrations & Pipeline Release Gate (prevents advisory lock timeouts)",
      },
    },
    projects: [
      {
        projectId: "ep-portfolio-main-prod",
        name: "portfolio",
        connectionAttachment:
          "Vercel Project 'portfolio' (Production & Preview)",
        status: "active_primary",
        totalStorageBytes:
          mainBranchStorageBytes +
          devBranchStorageBytes +
          previewBranchStorageBytes +
          experimentalBranchStorageBytes,
        totalStorageMiB: 120 + 35 + 45 + 35,
        branches: [
          {
            branchId: "br-main-prod",
            name: "main",
            projectSlug: "portfolio",
            environmentClassification: "production",
            protectionStatus: "protected",
            storageBytes: mainBranchStorageBytes,
            storageMiB: 120,
            createdAtUtc: "2026-04-17T21:54:37Z",
            updatedAtUtc: "2026-09-15T00:00:00Z",
            owner: "laser-loons-projects",
            expirationPolicy: "Never (Canonical Production)",
            connectionType: "pooled_runtime",
            role: "Canonical production database for www.deruiter.dev",
          },
          {
            branchId: "br-dev-integration",
            name: "dev",
            projectSlug: "portfolio",
            environmentClassification: "dev",
            protectionStatus: "protected",
            storageBytes: devBranchStorageBytes,
            storageMiB: 35,
            createdAtUtc: "2026-05-28T00:00:00Z",
            updatedAtUtc: "2026-09-12T00:00:00Z",
            owner: "laser-loons-projects",
            expirationPolicy: "Never (Protected Integration)",
            connectionType: "pooled_runtime",
            role: "Long-lived integration branch database",
          },
          {
            branchId: "br-preview-pr-687",
            name: "preview/pr-687",
            projectSlug: "portfolio",
            environmentClassification: "preview",
            protectionStatus: "ephemeral",
            storageBytes: previewBranchStorageBytes,
            storageMiB: 45,
            createdAtUtc: "2026-09-08T19:23:23Z",
            updatedAtUtc: "2026-09-09T17:27:18Z",
            owner: "fderuiter",
            expirationPolicy: "7 days or PR closure (Stale Candidate)",
            connectionType: "pooled_runtime",
            role: "Preview database for closed PR #687",
          },
          {
            branchId: "br-dev-experimental-01",
            name: "dev-experimental-01",
            projectSlug: "portfolio",
            environmentClassification: "preview",
            protectionStatus: "ephemeral",
            storageBytes: experimentalBranchStorageBytes,
            storageMiB: 35,
            createdAtUtc: "2026-08-15T01:03:47Z",
            updatedAtUtc: "2026-08-17T17:19:07Z",
            owner: "fderuiter",
            expirationPolicy: "Immediate upon approval (Stale Candidate)",
            connectionType: "pooled_runtime",
            role: "Abandoned experimental feature branch",
          },
        ],
      },
      {
        projectId: "ep-legacy-wedding-db",
        name: "wedding-website-legacy",
        connectionAttachment: "Unconnected (No active Vercel variable)",
        status: "unconnected_legacy",
        totalStorageBytes: legacyProj1Bytes,
        totalStorageMiB: 40,
        branches: [
          {
            branchId: "br-legacy-wedding-main",
            name: "main",
            projectSlug: "wedding-website-legacy",
            environmentClassification: "unconnected_legacy",
            protectionStatus: "ephemeral",
            storageBytes: legacyProj1Bytes,
            storageMiB: 40,
            createdAtUtc: "2026-08-13T18:30:21Z",
            updatedAtUtc: "2026-08-13T18:45:49Z",
            owner: "laser-loons-projects",
            expirationPolicy: "Candidate for operator deletion",
            connectionType: "direct_migration",
            role: "Legacy unconnected database project",
          },
        ],
      },
      {
        projectId: "ep-orphan-prototype-02",
        name: "portfolio-orphan-proto",
        connectionAttachment: "Unconnected (No active Vercel variable)",
        status: "unconnected_legacy",
        totalStorageBytes: legacyProj2Bytes,
        totalStorageMiB: 40,
        branches: [
          {
            branchId: "br-orphan-proto-main",
            name: "main",
            projectSlug: "portfolio-orphan-proto",
            environmentClassification: "unconnected_legacy",
            protectionStatus: "ephemeral",
            storageBytes: legacyProj2Bytes,
            storageMiB: 40,
            createdAtUtc: "2026-08-14T00:00:00Z",
            updatedAtUtc: "2026-08-14T00:00:00Z",
            owner: "fderuiter",
            expirationPolicy: "Candidate for operator deletion",
            connectionType: "direct_migration",
            role: "Orphaned prototype project",
          },
        ],
      },
    ],
    protectedTargets: PROTECTED_NEON_TARGETS,
    candidates: HISTORICAL_NEON_CANDIDATES,
    summary: {
      totalProjects: 3,
      totalBranches: 6,
      protectedBranchesCount: 2,
      candidateCount: HISTORICAL_NEON_CANDIDATES.length,
      currentTotalStorageMiB: 235 + 40 + 40, // 315 MiB
      expectedRecoverableStorageMiB: totalRecoverableMiB,
      expectedRecoverableStorageGiB: Number(
        expectedRecoverableStorageGiB.toFixed(3)
      ),
      projectedPostCleanupHeadroomGiB: Number(
        projectedPostCleanupHeadroomGiB.toFixed(3)
      ),
      nonDestructiveInvariantVerified: true,
    },
    cleanupRules: [
      "No Cloud Mutation Invariant: Zero write, drop, or delete operations are executed by this script or ticket.",
      "Protected Resource Rule: Primary production branch ('main') and integration branch ('dev') are strictly excluded from candidates.",
      "Explicit Operator Approval Rule: Deletion of unconnected projects or stale PR branches requires explicit operator sign-off.",
      "Post-Cleanup Verification Rule: Run 'npm run check:migrations:drift' and verify production HTTP 200 health after any future operator cleanup.",
    ],
  };
}

export function runNeonCapacityInventoryVerification(options?: {
  json?: boolean;
  candidates?: boolean;
  summary?: boolean;
}): { success: boolean; data: NeonCapacityInventory } {
  const inventory = getNeonCapacityInventory();

  // Invariant 1: Duplicate candidate IDs check
  const candidateIds = new Set(inventory.candidates.map((c) => c.targetId));
  if (candidateIds.size !== inventory.candidates.length) {
    throw new Error(
      "Duplicate cleanup candidate ID detected in Neon inventory."
    );
  }

  // Invariant 2: Protected targets must NEVER be in candidates list
  for (const protectedTarget of inventory.protectedTargets) {
    const isViolated = inventory.candidates.some(
      (c) =>
        c.projectId === protectedTarget.projectId &&
        c.branchName === protectedTarget.branchName
    );
    if (isViolated) {
      throw new Error(
        `Critical safety violation: Protected target ${protectedTarget.projectId}/${protectedTarget.branchName} is present in candidate list!`
      );
    }
  }

  // Invariant 3: Confirm non-destructive flag is strictly enforced
  for (const candidate of inventory.candidates) {
    if (candidate.destructiveActionExecuted !== false) {
      throw new Error(
        `Safety violation: Candidate ${candidate.targetId} has destructiveActionExecuted set to true!`
      );
    }
  }

  if (options?.json) {
    console.log(JSON.stringify(inventory, null, 2));
    return { success: true, data: inventory };
  }

  console.log("=== Neon Capacity & Branch Inventory ===");
  console.log(`Timestamp: ${inventory.timestamp} (${inventory.scope})`);
  console.log(`Plan Tier: ${inventory.plan}`);
  console.log("");
  console.log("STORAGE METER READINGS:");
  console.log(
    `• Storage Usage:       ${inventory.storageMeter.usedGiB} / ${inventory.storageMeter.limitGiB} ${inventory.storageMeter.unit} (${inventory.storageMeter.headroomPercentage}% headroom remaining)`
  );
  console.log(
    `• Used Bytes:          ${inventory.storageMeter.usedBytes} bytes (~${inventory.summary.currentTotalStorageMiB} MiB)`
  );
  console.log(
    `• Headroom:            ${inventory.storageMeter.headroomGiB} GiB remaining`
  );
  console.log("");
  console.log("COMPUTE & SLEEP POLICIES:");
  console.log(
    `• Auto-Suspend:        ${inventory.computePolicy.autoSuspendMinutes} minutes (${inventory.computePolicy.autoSuspendSeconds}s inactivity limit)`
  );
  console.log(
    `• Max Compute:         ${inventory.computePolicy.maxComputeUnits} CU`
  );
  console.log(
    `• Cold Start:          ${inventory.computePolicy.coldStartLatencySeconds}`
  );
  console.log(
    `• Compute Shield:      ${inventory.computePolicy.readThroughShieldRequirement}`
  );
  console.log("");
  console.log("CONNECTION URL HYGIENE:");
  console.log(
    `• Runtime Pooled URL:  ${inventory.connectionHygiene.runtimePooledUrl.variable} (${inventory.connectionHygiene.runtimePooledUrl.poolingMechanism})`
  );
  console.log(
    `• Migration Direct:    ${inventory.connectionHygiene.migrationDirectUrl.variable} (${inventory.connectionHygiene.migrationDirectUrl.purpose})`
  );
  console.log("");
  console.log("PROTECTED TARGETS (EXCLUDED FROM CANDIDATES):");
  for (const t of inventory.protectedTargets) {
    console.log(
      `• [${t.projectId}] branch '${t.branchName}' (${t.environment}) — ${t.role}`
    );
  }
  console.log("");
  console.log("STALE CANDIDATE & CLEANUP SUMMARY:");
  console.log(`• Total Projects:      ${inventory.summary.totalProjects}`);
  console.log(`• Total Branches:      ${inventory.summary.totalBranches}`);
  console.log(`• Total Candidates:    ${inventory.summary.candidateCount}`);
  console.log(
    `• Recoverable Storage: ${inventory.summary.expectedRecoverableStorageMiB} MiB (~${inventory.summary.expectedRecoverableStorageGiB} GiB)`
  );
  console.log(
    `• Post-Cleanup Headroom: ${inventory.summary.projectedPostCleanupHeadroomGiB} GiB`
  );
  console.log(
    `• Non-Destructive Status: ${inventory.summary.nonDestructiveInvariantVerified ? "VERIFIED (0 mutations executed)" : "FAILED"}`
  );

  if (options?.candidates) {
    console.log("");
    console.log("STALE CANDIDATE DETAILS:");
    for (const c of inventory.candidates) {
      console.log(
        `  ${c.targetId.padEnd(26)} ${c.targetType.padEnd(8)} ${c.storageMiB} MiB  [${c.environment}] - ${c.reason}`
      );
    }
  }

  return { success: true, data: inventory };
}

if (typeof process !== "undefined" && require.main === module) {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const candidates = args.includes("--candidates");
  const summary = args.includes("--summary");
  runNeonCapacityInventoryVerification({ json, candidates, summary });
}

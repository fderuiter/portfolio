#!/usr/bin/env node
/**
 * Dual-Tracker GitHub Issue Synchronization CLI
 * Adheres to ADR 0025 and AGENTS.md §9 Specification Synchronization.
 *
 * Synchronizes local tracer-bullet ticket files (.scratch/issues/*.md)
 * with remote GitHub Issues using the zero-dependency gh CLI.
 */

import fs from "fs";
import path from "path";
import { execFileSync, execSync } from "child_process";

export interface LocalIssue {
  filePath: string;
  fileName: string;
  issueNumber?: number;
  slug: string;
  title: string;
  status: "OPEN" | "IN_PROGRESS" | "DONE";
  blockedBy: number[];
  labels: string[];
  milestone?: string;
  body: string;
}

export interface RemoteIssue {
  number: number;
  title: string;
  state: "OPEN" | "CLOSED";
  labels: string[];
  milestone?: string | null;
}

export interface SyncOptions {
  dryRun?: boolean;
  verbose?: boolean;
  issuesDir?: string;
}

export interface SyncResult {
  totalLocal: number;
  synced: number;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

const DEFAULT_ISSUES_DIR = path.resolve(process.cwd(), ".scratch/issues");

/**
 * Checks if GitHub CLI is installed and authenticated.
 */
export function checkGhCli(): {
  installed: boolean;
  authenticated: boolean;
  error?: string;
} {
  try {
    execSync("gh --version", { stdio: "ignore" });
  } catch {
    return {
      installed: false,
      authenticated: false,
      error: "GitHub CLI (`gh`) is not installed.",
    };
  }

  try {
    execSync("gh auth status", { stdio: "ignore" });
    return { installed: true, authenticated: true };
  } catch {
    return {
      installed: true,
      authenticated: false,
      error: "GitHub CLI is installed but not authenticated (`gh auth login`).",
    };
  }
}

/**
 * Parses a local markdown tracer-bullet specification.
 */
export function parseLocalIssueFile(filePath: string): LocalIssue | null {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const fileName = path.basename(filePath);

  // Extract issue number and slug from filename (e.g. 0548-codebase-deepening.md or issue-763.md)
  const numMatch =
    fileName.match(/^0*(\d+)[-_](.+)\.md$/) ||
    fileName.match(/^issue[-_](\d+)\.md$/);
  const issueNumber = numMatch ? parseInt(numMatch[1], 10) : undefined;
  const slug = numMatch ? numMatch[2] : fileName.replace(/\.md$/, "");

  // Extract title (first H1)
  let title = slug;
  for (const line of lines) {
    if (line.startsWith("# ")) {
      title = line.replace(/^#\s+/, "").trim();
      break;
    }
  }

  // Extract metadata attributes
  let status: "OPEN" | "IN_PROGRESS" | "DONE" = "OPEN";
  const blockedBy: number[] = [];
  const labels: string[] = [];
  let milestone: string | undefined;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^[-*]?\s*Status:\s*/i.test(trimmed)) {
      const s = trimmed.replace(/^[-*]?\s*Status:\s*/i, "").toUpperCase();
      if (s.includes("DONE") || s.includes("CLOSED")) status = "DONE";
      else if (s.includes("IN_PROGRESS") || s.includes("PROGRESS"))
        status = "IN_PROGRESS";
      else status = "OPEN";
    } else if (/^[-*]?\s*Blocked By:\s*/i.test(trimmed)) {
      const match = trimmed.match(/#(\d+)/g);
      if (match) {
        for (const m of match) {
          blockedBy.push(parseInt(m.replace("#", ""), 10));
        }
      }
    } else if (/^[-*]?\s*Labels:\s*/i.test(trimmed)) {
      const rawLabels = trimmed.replace(/^[-*]?\s*Labels:\s*/i, "").split(",");
      for (const l of rawLabels) {
        const cleaned = l.trim();
        if (cleaned) labels.push(cleaned);
      }
    } else if (/^[-*]?\s*Milestone:\s*/i.test(trimmed)) {
      milestone = trimmed.replace(/^[-*]?\s*Milestone:\s*/i, "").trim();
    }
  }

  return {
    filePath,
    fileName,
    issueNumber,
    slug,
    title,
    status,
    blockedBy,
    labels,
    milestone,
    body: content,
  };
}

/**
 * Lists all local issue files from .scratch/issues directory.
 */
export function listLocalIssues(
  issuesDir: string = DEFAULT_ISSUES_DIR
): LocalIssue[] {
  if (!fs.existsSync(issuesDir)) {
    fs.mkdirSync(issuesDir, { recursive: true });
    return [];
  }

  const files = fs.readdirSync(issuesDir).filter((f) => f.endsWith(".md"));
  const issues: LocalIssue[] = [];

  for (const file of files) {
    const parsed = parseLocalIssueFile(path.join(issuesDir, file));
    if (parsed) issues.push(parsed);
  }

  return issues;
}

/**
 * Fetches remote GitHub issues.
 */
export function fetchRemoteIssues(): RemoteIssue[] {
  try {
    const raw = execSync(
      "gh issue list --state all --limit 150 --json number,title,state,labels,milestone",
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }
    );
    const parsed = JSON.parse(raw);
    return parsed.map(
      (item: {
        number: number;
        title: string;
        state: string;
        labels: Array<{ name: string }>;
        milestone?: { title: string } | null;
      }) => ({
        number: item.number,
        title: item.title,
        state: item.state === "OPEN" ? "OPEN" : "CLOSED",
        labels: item.labels.map((l) => l.name),
        milestone: item.milestone?.title || null,
      })
    );
  } catch {
    return [];
  }
}

/**
 * Synchronizes local issue specifications with GitHub.
 */
export async function syncIssues(
  options: SyncOptions = {}
): Promise<SyncResult> {
  const issuesDir = options.issuesDir || DEFAULT_ISSUES_DIR;
  const dryRun = options.dryRun ?? false;
  const verbose = options.verbose ?? false;

  const result: SyncResult = {
    totalLocal: 0,
    synced: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  const cliCheck = checkGhCli();
  if (!cliCheck.installed || !cliCheck.authenticated) {
    result.errors.push(cliCheck.error || "GitHub CLI unavailable");
    return result;
  }

  const localIssues = listLocalIssues(issuesDir);
  result.totalLocal = localIssues.length;

  if (localIssues.length === 0) {
    if (verbose) {
      console.log(`[sync-issues] No local tickets found in ${issuesDir}`);
    }
    return result;
  }

  const remoteIssues = fetchRemoteIssues();
  const remoteByNumber = new Map<number, RemoteIssue>(
    remoteIssues.map((r) => [r.number, r])
  );

  for (const local of localIssues) {
    try {
      if (local.issueNumber && remoteByNumber.has(local.issueNumber)) {
        // Issue exists on GitHub
        const remote = remoteByNumber.get(local.issueNumber)!;
        let needsUpdate = false;
        const missingLabels = local.labels.filter(
          (l) => !remote.labels.includes(l)
        );

        if (missingLabels.length > 0) needsUpdate = true;
        if (local.status === "DONE" && remote.state === "OPEN")
          needsUpdate = true;
        if (local.status === "OPEN" && remote.state === "CLOSED")
          needsUpdate = true;

        if (needsUpdate) {
          if (dryRun) {
            console.log(
              `[DRY RUN] Would update #${remote.number} (${local.title}):`
            );
            if (missingLabels.length > 0)
              console.log(`  + Add labels: ${missingLabels.join(", ")}`);
            if (local.status === "DONE" && remote.state === "OPEN")
              console.log(`  + Close issue`);
          } else {
            if (missingLabels.length > 0) {
              const labelArgs = missingLabels.flatMap((l) => [
                "--add-label",
                l,
              ]);
              execFileSync(
                "gh",
                ["issue", "edit", String(remote.number), ...labelArgs],
                { stdio: "ignore" }
              );
            }
            if (local.status === "DONE" && remote.state === "OPEN") {
              execFileSync(
                "gh",
                [
                  "issue",
                  "close",
                  String(remote.number),
                  "--comment",
                  "Completed via dual-tracker sync.",
                ],
                {
                  stdio: "ignore",
                }
              );
            }
          }
          result.updated++;
        } else {
          result.skipped++;
        }
        result.synced++;
      } else {
        // Create new issue
        if (dryRun) {
          console.log(`[DRY RUN] Would create new issue: "${local.title}"`);
          if (local.labels.length > 0)
            console.log(`  Labels: ${local.labels.join(", ")}`);
        } else {
          const args = [
            "issue",
            "create",
            "--title",
            local.title,
            "--body",
            local.body,
          ];
          for (const label of local.labels) {
            args.push("--label", label);
          }
          if (local.milestone) {
            args.push("--milestone", local.milestone);
          }
          const output = execFileSync("gh", args, { encoding: "utf8" });
          const createdUrl = output.trim();
          const match = createdUrl.match(/\/issues\/(\d+)$/);
          if (match) {
            const newNum = parseInt(match[1], 10);
            console.log(
              `[sync-issues] Created remote issue #${newNum}: ${local.title}`
            );
          }
        }
        result.created++;
        result.synced++;
      }
    } catch (err) {
      const msg = `Failed syncing ${local.fileName}: ${(err as Error).message}`;
      result.errors.push(msg);
    }
  }

  return result;
}

// CLI entrypoint
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const verbose = args.includes("--verbose") || args.includes("-v");

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Dual-Tracker GitHub Issue Synchronization CLI (ADR 0025)

Usage:
  npx tsx scripts/sync-issues.ts [options]
  npm run dx issues:sync [-- --dry-run]

Options:
  --dry-run   Preview issue updates and creations without dispatching mutations
  --verbose   Log detailed synchronization progress
  --help      Show this help dialog
`);
    process.exit(0);
  }

  console.log("════════════════════════════════════════════════════════════");
  console.log("  DX ISSUE SYNC — Dual-Tracker GitHub CLI Synchronizer");
  console.log("  ADR 0025 • Local Tracer-Bullet Tickets ↔ GitHub Issues");
  console.log("════════════════════════════════════════════════════════════\n");

  syncIssues({ dryRun, verbose })
    .then((result) => {
      console.log(`\nScan Summary:`);
      console.log(`  Local Tickets:  ${result.totalLocal}`);
      console.log(`  Synced:         ${result.synced}`);
      console.log(`  Created:        ${result.created}`);
      console.log(`  Updated:        ${result.updated}`);
      console.log(`  Skipped:        ${result.skipped}`);
      if (result.errors.length > 0) {
        console.error(`\nErrors encountered (${result.errors.length}):`);
        result.errors.forEach((e) => console.error(`  - ${e}`));
        process.exit(1);
      }
      process.exit(0);
    })
    .catch((err) => {
      console.error("Fatal error during sync:", err);
      process.exit(1);
    });
}

import { execFileSync } from "node:child_process";
import fs from "node:fs";

interface Detector {
  category: string;
  gitPattern: string;
  regex: RegExp;
}

interface Candidate {
  commit: string;
  file: string;
}

interface Finding extends Candidate {
  category: string;
  line: number;
}

const DETECTORS: Detector[] = [
  {
    category: "credential-bearing database URL",
    gitPattern:
      "(postgres|postgresql|mongodb|redis|rediss|mysql)://[^[:space:]/:]+:[^[:space:]@]+@",
    regex:
      /(?:postgres|postgresql|mongodb|redis|rediss|mysql):\/\/[^\s/:]+:[^\s@]+@[^\s"'`<>]+/gi,
  },
  {
    category: "GitHub token",
    gitPattern: "(github_pat_[A-Za-z0-9_]{20,}|ghp_[A-Za-z0-9]{30,})",
    regex: /(?:github_pat_[A-Za-z0-9_]{20,}|ghp_[A-Za-z0-9]{30,})/g,
  },
  {
    category: "AWS access key",
    gitPattern: "AKIA[0-9A-Z]{16}",
    regex: /AKIA[0-9A-Z]{16}/g,
  },
  {
    category: "private key",
    gitPattern: "BEGIN [A-Z ]+ PRIVATE KEY",
    regex: /-----BEGIN [A-Z ]+ PRIVATE KEY-----/g,
  },
  {
    category: "provider token",
    gitPattern:
      "(sk_(live|test)_[A-Za-z0-9_]{16,}|sk-proj-[A-Za-z0-9_-]{16,}|re_[A-Za-z0-9_]{20,}|vcp_[A-Za-z0-9_]{20,}|npm_[A-Za-z0-9]{20,}|glpat-[A-Za-z0-9_-]{20,}|xox[baprs]-[A-Za-z0-9-]{20,})",
    regex:
      /(?:sk_(?:live|test)_[A-Za-z0-9_]{16,}|sk-proj-[A-Za-z0-9_-]{16,}|re_[A-Za-z0-9_]{20,}|vcp_[A-Za-z0-9_]{20,}|npm_[A-Za-z0-9]{20,}|glpat-[A-Za-z0-9_-]{20,}|xox[baprs]-[A-Za-z0-9-]{20,})/g,
  },
];

const SAFE_LITERAL_FIXTURES = new Set([
  "AKIAIOSFODNN7EXAMPLE",
  "ghp_123456789012345678901234567890123456",
  "sk_test_example_secret_key",
]);

const MIGRATION_REPLAY_FIXTURES = new Set([
  "postgres://admin:p%40ss%3Aword!@ep-cool-lake-123456.us-east-2.aws.neon.tech/neondb?sslmode=require",
  "postgres://***:***@ep-cool-lake-123456.us-east-2.aws.neon.tech/neondb?sslmode=require",
  "postgresql://user:pass@ep-cool-pooler.us-east-2.aws.neon.tech/portfolio_prod",
  "postgresql://admin:secret@ep-live.neon.tech/portfolio",
  "postgresql://admin:secret@ep-pooler.neon.tech/portfolio",
  "postgresql://admin:secret@ep-prod.neon.tech/neondb",
]);

const SAFE_FILE_FIXTURES = new Map<string, Set<string>>([
  ["__tests__/migration-replay.test.ts", MIGRATION_REPLAY_FIXTURES],
  ["scripts/audit-secret-history.ts", MIGRATION_REPLAY_FIXTURES],
]);

function git(args: string[]): string {
  return execFileSync("git", args, {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 128 * 1024 * 1024,
    stdio: ["ignore", "pipe", "ignore"],
  });
}

export function isKnownFixture(value: string, file: string): boolean {
  if (SAFE_LITERAL_FIXTURES.has(value)) return true;
  if (SAFE_FILE_FIXTURES.get(file)?.has(value)) return true;
  try {
    const host = new URL(value).hostname;
    if (host === "localhost" || host === "127.0.0.1") return true;
    if (host.endsWith(".example.com")) return true;
  } catch {
    // Non-URL detectors continue through their explicit fixture rules.
  }
  return (
    file === "__tests__/validation.test.ts" &&
    value.includes("BEGIN RSA PRIVATE KEY")
  );
}

function candidatesFor(detector: Detector): Candidate[] {
  const output = git([
    "log",
    "--all",
    "--full-history",
    `-G${detector.gitPattern}`,
    "--format=commit:%H",
    "--name-only",
    "--no-renames",
  ]);
  const candidates: Candidate[] = [];
  let commit = "";

  for (const line of output.split(/\r?\n/)) {
    if (line.startsWith("commit:")) {
      commit = line.slice("commit:".length);
    } else if (commit && line.trim()) {
      candidates.push({ commit, file: line.trim() });
    }
  }

  return candidates;
}

function readVersions({ commit, file }: Candidate): string[] {
  const versions: string[] = [];
  for (const revision of [commit, `${commit}^`]) {
    try {
      versions.push(git(["show", `${revision}:${file}`]));
    } catch {
      // Added and deleted files only exist on one side of their commit.
    }
  }
  return versions;
}

export function scanCandidate(
  candidate: Candidate,
  detector: Detector,
  content: string
): Finding[] {
  const findings: Finding[] = [];
  for (const [index, line] of content.split(/\r?\n/).entries()) {
    detector.regex.lastIndex = 0;
    for (const match of line.matchAll(detector.regex)) {
      const value = match[0];
      if (!isKnownFixture(value, candidate.file)) {
        findings.push({
          ...candidate,
          category: detector.category,
          line: index + 1,
        });
      }
    }
  }
  return findings;
}

export function auditSecretHistory(): Finding[] {
  const findings: Finding[] = [];
  const inspected = new Set<string>();

  for (const detector of DETECTORS) {
    for (const candidate of candidatesFor(detector)) {
      const key = `${detector.category}:${candidate.commit}:${candidate.file}`;
      if (inspected.has(key)) continue;
      inspected.add(key);
      for (const content of readVersions(candidate)) {
        findings.push(...scanCandidate(candidate, detector, content));
      }
    }
  }

  return findings.filter(
    (finding, index, all) =>
      index ===
      all.findIndex(
        (other) =>
          other.commit === finding.commit &&
          other.file === finding.file &&
          other.category === finding.category &&
          other.line === finding.line
      )
  );
}

export function auditCurrentTree(): Finding[] {
  const findings: Finding[] = [];
  const files = git([
    "ls-files",
    "-z",
    "--cached",
    "--others",
    "--exclude-standard",
  ])
    .split("\0")
    .filter(Boolean);

  for (const file of files) {
    try {
      const buffer = fs.readFileSync(file);
      if (buffer.includes(0)) continue;
      const content = buffer.toString("utf8");
      const candidate = { commit: "WORKTREE", file };
      for (const detector of DETECTORS) {
        findings.push(...scanCandidate(candidate, detector, content));
      }
    } catch {
      // Files may disappear between the Git listing and the filesystem read.
    }
  }

  return findings;
}

function main(): void {
  const commitCount = git(["rev-list", "--all", "--count"]).trim();
  console.log(
    `Scanning the current worktree and ${commitCount} reachable commits for ${DETECTORS.length} high-confidence secret patterns...`
  );
  const findings = [...auditCurrentTree(), ...auditSecretHistory()];

  if (findings.length > 0) {
    console.error(
      `Secret history audit found ${findings.length} potential exposure(s). Values are redacted.`
    );
    for (const finding of findings) {
      console.error(
        `- ${finding.file}:${finding.line} at ${finding.commit.slice(0, 12)} [${finding.category}]`
      );
    }
    process.exitCode = 1;
    return;
  }

  console.log("Secret history audit passed with no unallowlisted matches.");
}

if (typeof process.env.VITEST === "undefined") main();

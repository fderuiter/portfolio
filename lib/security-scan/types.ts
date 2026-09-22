/**
 * Public type contracts for the unified secret-scanning catalog.
 */

/**
 * Which scanning surfaces a detector is safe/intended to run under.
 *
 * - `contentGuard`: DX Doctor's repository scan and the pre-commit staged-file
 *   guard. Runs once against the current working tree, human-reviewed before
 *   a commit lands, so lower-confidence heuristics are acceptable here.
 * - `historyAudit`: the reachable-history audit (current tree plus every
 *   commit). Runs unattended in CI across the entire repository with no
 *   directory exclusions, so only high-confidence, low-false-positive
 *   detectors should opt in.
 */
export type ScannerSurface = "contentGuard" | "historyAudit";

/**
 * A single secret detector: its identity, its live-text regex, and its
 * pickaxe-compatible (`git log -G`) representation for history scanning.
 */
export interface SecretDetector {
  readonly id: string;
  readonly description: string;
  readonly regex: RegExp;
  /** POSIX extended-regex form consumed by `git log -G<pattern>`. */
  readonly gitPattern: string;
  readonly appliesTo: readonly ScannerSurface[];
}

/**
 * Safe diagnostic metadata for a match: enough to locate and triage a
 * finding without ever carrying the candidate secret value itself.
 */
export interface ScanFinding {
  readonly detectorId: string;
  readonly category: string;
  readonly file: string;
  readonly line: number;
}

/** A {@link ScanFinding} located at a specific reachable commit. */
export interface HistoryFinding extends ScanFinding {
  readonly commit: string;
}

/** Safe (non-functional) positive and negative fixtures for a detector. */
export interface SecretDetectorFixtureSet {
  /** Values that MUST be reported when scanned (and are not allowlisted). */
  readonly positive: readonly string[];
  /** Values that MUST NOT be reported by this detector. */
  readonly negative: readonly string[];
}

import type { HistoryFinding, ScanFinding } from "../types";

function isHistoryFinding(
  finding: ScanFinding | HistoryFinding
): finding is HistoryFinding {
  return "commit" in finding;
}

/**
 * Formats a finding as a single redacted, human-readable line. Every
 * console-facing scanner entrypoint routes through this function so the
 * candidate secret value is structurally impossible to print: `ScanFinding`
 * and `HistoryFinding` never carry the matched text, only safe diagnostic
 * metadata (detector, file, line, and commit when applicable).
 */
export function formatFinding(finding: ScanFinding | HistoryFinding): string {
  const location = isHistoryFinding(finding)
    ? `${finding.file}:${finding.line} at ${finding.commit.slice(0, 12)}`
    : `${finding.file}:${finding.line}`;
  return `  - ${location} [${finding.category}] (value redacted)`;
}

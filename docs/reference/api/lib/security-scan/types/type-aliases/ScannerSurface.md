[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/security-scan/types](../README.md) / ScannerSurface

# Type Alias: ScannerSurface

> **ScannerSurface** = `"contentGuard"` \| `"historyAudit"`

Which scanning surfaces a detector is safe/intended to run under.

- `contentGuard`: DX Doctor's repository scan and the pre-commit staged-file
  guard. Runs once against the current working tree, human-reviewed before
  a commit lands, so lower-confidence heuristics are acceptable here.
- `historyAudit`: the reachable-history audit (current tree plus every
  commit). Runs unattended in CI across the entire repository with no
  directory exclusions, so only high-confidence, low-false-positive
  detectors should opt in.

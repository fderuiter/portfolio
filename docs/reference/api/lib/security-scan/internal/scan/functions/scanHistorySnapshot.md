[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/security-scan/internal/scan](../README.md) / scanHistorySnapshot

# Function: scanHistorySnapshot()

> **scanHistorySnapshot**(`content`, `candidate`, `detectors?`): [`HistoryFinding`](../../../types/interfaces/HistoryFinding.md)[]

Scans a single snapshot of file content (a working-tree file, or a file
as it existed at a specific commit) against every match of every given
detector, reporting every occurrence rather than one-per-line. Defaults
to the full `historyAudit`-surface detector set; callers auditing a
pickaxe candidate for one specific detector should narrow it explicitly
so an unrelated pre-existing match elsewhere in the file isn't
re-reported against every commit that merely touches the file.

## Parameters

### content

`string`

### candidate

#### commit

`string`

#### file

`string`

### detectors?

readonly [`SecretDetector`](../../../types/interfaces/SecretDetector.md)[] = `...`

## Returns

[`HistoryFinding`](../../../types/interfaces/HistoryFinding.md)[]

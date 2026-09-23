[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/security-scan/internal/scan](../README.md) / scanText

# Function: scanText()

> **scanText**(`text`, `file?`): [`ScanFinding`](../../../types/interfaces/ScanFinding.md)[]

Scans text against every `contentGuard`-surface detector, reporting at
most one finding per line (the first detector to match), mirroring the
behavior DX Doctor and the pre-commit guard have always relied on.

`file` identifies the source for allowlist purposes (and is echoed back
on the returned finding); it may be an absolute path, in which case it is
normalized relative to `process.cwd()` before allowlist lookups.

## Parameters

### text

`string`

### file?

`string` = `""`

## Returns

[`ScanFinding`](../../../types/interfaces/ScanFinding.md)[]

[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/security-scan/internal/redact](../README.md) / formatFinding

# Function: formatFinding()

> **formatFinding**(`finding`): `string`

Formats a finding as a single redacted, human-readable line. Every
console-facing scanner entrypoint routes through this function so the
candidate secret value is structurally impossible to print: `ScanFinding`
and `HistoryFinding` never carry the matched text, only safe diagnostic
metadata (detector, file, line, and commit when applicable).

## Parameters

### finding

[`ScanFinding`](../../../types/interfaces/ScanFinding.md) \| [`HistoryFinding`](../../../types/interfaces/HistoryFinding.md)

## Returns

`string`

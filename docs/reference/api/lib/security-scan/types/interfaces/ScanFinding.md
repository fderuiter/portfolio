[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/security-scan/types](../README.md) / ScanFinding

# Interface: ScanFinding

Safe diagnostic metadata for a match: enough to locate and triage a
finding without ever carrying the candidate secret value itself.

## Extended by

- [`HistoryFinding`](HistoryFinding.md)

## Properties

### category

> `readonly` **category**: `string`

***

### detectorId

> `readonly` **detectorId**: `string`

***

### file

> `readonly` **file**: `string`

***

### line

> `readonly` **line**: `number`

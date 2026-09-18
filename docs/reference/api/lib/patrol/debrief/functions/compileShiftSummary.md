[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/patrol/debrief](../README.md) / compileShiftSummary

# Function: compileShiftSummary()

> **compileShiftSummary**(`events`, `elapsedMinutes`): [`ShiftDebriefSummary`](../../types/interfaces/ShiftDebriefSummary.md)

Compiles the end-of-shift debrief summary by grouping a shift's full
`PatrolEvent[]` history back into per-incident slices (by `scenarioId`),
evaluating each independently, and aggregating the results.

## Parameters

### events

[`PatrolEvent`](../../types/interfaces/PatrolEvent.md)[]

### elapsedMinutes

`number`

## Returns

[`ShiftDebriefSummary`](../../types/interfaces/ShiftDebriefSummary.md)

[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/patrol/debrief](../README.md) / derivePlayfulStats

# Function: derivePlayfulStats()

> **derivePlayfulStats**(`events`): [`ShiftPlayfulStats`](../../types/interfaces/ShiftPlayfulStats.md)

Derives non-clinical, operational activity counters from a shift's full
`PatrolEvent[]` history. Every counter is a single pass filter/count over
disjoint predicates, so no event is ever attributed to a counter twice.

## Parameters

### events

[`PatrolEvent`](../../types/interfaces/PatrolEvent.md)[]

## Returns

[`ShiftPlayfulStats`](../../types/interfaces/ShiftPlayfulStats.md)

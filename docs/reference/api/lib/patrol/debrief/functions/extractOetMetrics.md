[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/patrol/debrief](../README.md) / extractOetMetrics

# Function: extractOetMetrics()

> **extractOetMetrics**(`events`): [`OetMetrics`](../../types/interfaces/OetMetrics.md) \| `undefined`

Extracts the most recent completed OET descent's metrics from a
`PatrolEvent[]` slice (reading the `OET_TRANSPORT_COMPLETED` event's own
`payload`/`context`), for callers that need to hand metrics into
`evaluateIncidentDebrief` themselves rather than going through
`compileShiftSummary`.

## Parameters

### events

[`PatrolEvent`](../../types/interfaces/PatrolEvent.md)[]

## Returns

[`OetMetrics`](../../types/interfaces/OetMetrics.md) \| `undefined`

[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/patrol/debrief](../README.md) / evaluateIncidentDebrief

# Function: evaluateIncidentDebrief()

> **evaluateIncidentDebrief**(`scenarioId`, `events`, `oetMetrics?`): [`IncidentDebriefResult`](../../types/interfaces/IncidentDebriefResult.md)

Evaluates a single incident's contextual debrief from its `PatrolEvent[]`
slice and optional live OET descent metrics.

Never crashes on an empty or malformed event history: every dimension
falls back to a neutral "developing" baseline (AGENTS.md #11).

## Parameters

### scenarioId

`string`

### events

[`PatrolEvent`](../../types/interfaces/PatrolEvent.md)[]

### oetMetrics?

[`OetMetrics`](../../types/interfaces/OetMetrics.md)

## Returns

[`IncidentDebriefResult`](../../types/interfaces/IncidentDebriefResult.md)

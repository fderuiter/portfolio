[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/patrol/engine](../README.md) / collectIncidentEvents

# Function: collectIncidentEvents()

> **collectIncidentEvents**(`eventHistory`, `activeEvents`, `scenarioId`): [`PatrolEvent`](../../types/interfaces/PatrolEvent.md)[]

Merges, filters, and deduplicates events from an event history and active events list,
scoped to a single scenarioId in chronological order.

## Parameters

### eventHistory

[`PatrolEvent`](../../types/interfaces/PatrolEvent.md)[]

### activeEvents

[`PatrolEvent`](../../types/interfaces/PatrolEvent.md)[]

### scenarioId

`string` \| `null` \| `undefined`

## Returns

[`PatrolEvent`](../../types/interfaces/PatrolEvent.md)[]

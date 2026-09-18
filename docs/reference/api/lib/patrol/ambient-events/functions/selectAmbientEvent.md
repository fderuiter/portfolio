[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/patrol/ambient-events](../README.md) / selectAmbientEvent

# Function: selectAmbientEvent()

> **selectAmbientEvent**(`state`, `seed?`): [`AmbientEvent`](../../types/interfaces/AmbientEvent.md) \| `null`

Selects an ambient operational event deterministically using createSeededRandom.

Filters out already resolved events in the current shift cycle so patrollers
experience variety across all encounters without immediate back-to-back repeats.

## Parameters

### state

[`ShiftState`](../../types/interfaces/ShiftState.md)

Current shift state containing resolved event history.

### seed?

`number`

Optional numeric seed for deterministic PRNG selection.

## Returns

[`AmbientEvent`](../../types/interfaces/AmbientEvent.md) \| `null`

An AmbientEvent or null if the catalog is empty.

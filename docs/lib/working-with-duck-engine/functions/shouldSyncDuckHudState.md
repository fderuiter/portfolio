[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/working-with-duck-engine](../README.md) / shouldSyncDuckHudState

# Function: shouldSyncDuckHudState()

> **shouldSyncDuckHudState**(`nextState`): `boolean`

Decide whether a stepped state should be flushed to React UI state.

The canvas game loop steps the engine at 60 FPS but only syncs the
throttled React `uiState` on every 4th tick for DOM performance. Terminal
transitions (win/fail) must always flush immediately regardless of tick
remainder, otherwise `stepDuckGame` stops advancing (status is no longer
"running") while `uiState` is left showing the last throttled frame,
silently hiding the victory/failure panel.

## Parameters

### nextState

[`WorkingWithDuckState`](../interfaces/WorkingWithDuckState.md)

## Returns

`boolean`

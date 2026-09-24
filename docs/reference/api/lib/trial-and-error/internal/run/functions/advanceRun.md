[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/run](../README.md) / advanceRun

# Function: advanceRun()

> **advanceRun**(`act`, `run`, `action`): [`RunState`](../interfaces/RunState.md)

Pure run reducer. It composes the Card Table reducer for the current Blind
and moves between Blinds. The draw piles are fixed, so the same act and
action sequence always yields the same state.

## Parameters

### act

#### blinds

`object`[] = `...`

#### id

`string` = `identifier`

#### title

`string` = `...`

### run

[`RunState`](../interfaces/RunState.md)

### action

[`RunAction`](../type-aliases/RunAction.md)

## Returns

[`RunState`](../interfaces/RunState.md)

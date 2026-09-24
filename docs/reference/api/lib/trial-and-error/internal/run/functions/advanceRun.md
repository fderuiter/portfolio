[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/run](../README.md) / advanceRun

# Function: advanceRun()

> **advanceRun**(`act`, `run`, `action`): [`RunState`](../interfaces/RunState.md)

Pure run reducer. It composes the Card Table reducer for the current Blind
and moves between Blinds, drawing each later Blind's crisis from the
seeded event draw. The draw piles are fixed and every draw is a function
of the seed and draw index, so the same act, seed and action sequence
always yields the same state.

## Parameters

### act

#### blinds

`object`[] = `...`

#### bossPool?

`object`[] = `...`

#### crisisDeck?

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

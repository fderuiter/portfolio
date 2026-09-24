[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/run](../README.md) / createRunState

# Function: createRunState()

> **createRunState**(`act`, `seed?`): [`RunState`](../interfaces/RunState.md)

A fresh run for `seed`: the Boss drawn from the act's pool (a pool of one
is fixed and consumes no draw), and the first Blind dealt with full CPU.
The first Blind draws no crisis.

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

### seed?

`string` = `DEFAULT_SEED`

## Returns

[`RunState`](../interfaces/RunState.md)

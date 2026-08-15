[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/proof-utils](../README.md) / pruneStepOrNode

# Function: pruneStepOrNode()

> **pruneStepOrNode**(`stepOrNode`, `edges`, `theoremId?`): [`PruneResult`](../interfaces/PruneResult.md)

Defined in: [lib/proof-utils.ts:2546](https://github.com/fderuiter/portfolio/blob/main/lib/proof-utils.ts#L2546)

Prunes an intermediate lemma or conclusion deduction step and recursively removes dependent edges in the DAG.
Foundational premises are immutable axioms and cannot be deleted.

## Parameters

### stepOrNode

`string` \| `number`

### edges

[`Edge`](../interfaces/Edge.md)[]

### theoremId?

[`TheoremId`](../type-aliases/TheoremId.md) = `"modus-ponens"`

## Returns

[`PruneResult`](../interfaces/PruneResult.md)

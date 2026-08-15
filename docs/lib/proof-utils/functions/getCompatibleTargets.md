[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/proof-utils](../README.md) / getCompatibleTargets

# Function: getCompatibleTargets()

> **getCompatibleTargets**(`sourceId`, `theoremId?`, `edges?`): [`CompatibleTargetInfo`](../interfaces/CompatibleTargetInfo.md)[]

Defined in: [lib/proof-utils.ts:2846](https://github.com/fderuiter/portfolio/blob/main/lib/proof-utils.ts#L2846)

Returns all compatible target nodes and corresponding rule annotations for a source node.

## Parameters

### sourceId

`string`

### theoremId?

[`TheoremId`](../type-aliases/TheoremId.md) = `"modus-ponens"`

### edges?

[`Edge`](../interfaces/Edge.md)[] = `[]`

## Returns

[`CompatibleTargetInfo`](../interfaces/CompatibleTargetInfo.md)[]

[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/proof-utils](../README.md) / evaluateProofStatus

# Function: evaluateProofStatus()

> **evaluateProofStatus**(`edges`, `theoremId?`): `object`

Defined in: [lib/proof-utils.ts:1549](https://github.com/fderuiter/portfolio/blob/main/lib/proof-utils.ts#L1549)

Evaluates proof logical completion status based on graph edges and ASTs.

## Parameters

### edges

[`Edge`](../interfaces/Edge.md)[]

### theoremId?

[`TheoremId`](../type-aliases/TheoremId.md) = `"modus-ponens"`

## Returns

`object`

### isC\_Proven

> **isC\_Proven**: `boolean`

### isE\_Proven

> **isE\_Proven**: `boolean`

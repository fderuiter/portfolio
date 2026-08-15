[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/proof-utils](../README.md) / evaluateProofStatus

# Function: evaluateProofStatus()

> **evaluateProofStatus**(`edges`): `object`

Defined in: [lib/proof-utils.ts:104](https://github.com/fderuiter/portfolio/blob/main/lib/proof-utils.ts#L104)

Evaluates the proof logical progress based on current connections/edges.
Modus Ponens: A (P) and B (P to Q) yields C (Q)
Modus Ponens: C (Q) and D (Q to R) yields E (R)

## Parameters

### edges

[`Edge`](../interfaces/Edge.md)[]

## Returns

`object`

### isC\_Proven

> **isC\_Proven**: `boolean`

### isE\_Proven

> **isE\_Proven**: `boolean`

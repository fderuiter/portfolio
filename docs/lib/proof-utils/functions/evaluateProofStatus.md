[**temp_dir**](../../../README.md)

***

[temp_dir](../../../modules.md) / [lib/proof-utils](../README.md) / evaluateProofStatus

# Function: evaluateProofStatus()

> **evaluateProofStatus**(`edges`): `object`

Defined in: [lib/proof-utils.ts:76](https://github.com/fderuiter/portfolio/blob/e9125b13b4fd502f929719e363744f8eb92647bc/lib/proof-utils.ts#L76)

Evaluates the proof's logical progress based on current connections/edges.
Modus Ponens: A (P) and B (P -> Q) yields C (Q)
Modus Ponens: C (Q) and D (Q -> R) yields E (R)

## Parameters

### edges

[`Edge`](../interfaces/Edge.md)[]

## Returns

`object`

### isC\_Proven

> **isC\_Proven**: `boolean`

### isE\_Proven

> **isE\_Proven**: `boolean`

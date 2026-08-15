[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/proof-utils](../README.md) / getFallacyDiagnosis

# Function: getFallacyDiagnosis()

> **getFallacyDiagnosis**(`sourceId`, `targetId`, `_edges`, `_theoremId?`): [`FallacyDiagnosis`](../interfaces/FallacyDiagnosis.md)

Defined in: [lib/proof-utils.ts:1622](https://github.com/fderuiter/portfolio/blob/main/lib/proof-utils.ts#L1622)

Diagnoses formal logical fallacies and synthesizes counterexample truth table rows.

## Parameters

### sourceId

`string`

### targetId

`string`

### \_edges

[`Edge`](../interfaces/Edge.md)[]

### \_theoremId?

[`TheoremId`](../type-aliases/TheoremId.md) = `"modus-ponens"`

## Returns

[`FallacyDiagnosis`](../interfaces/FallacyDiagnosis.md)

[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/ast-evaluator](../README.md) / evaluateFormula

# Function: evaluateFormula()

> **evaluateFormula**(`formula`, `fieldValues`, `fieldsList`): `number`

Defined in: [lib/crf/ast-evaluator.ts:855](https://github.com/fderuiter/portfolio/blob/main/lib/crf/ast-evaluator.ts#L855)

Safely evaluates a math formula with dynamic field variables

## Parameters

### formula

`string`

Arithmetic string expression

### fieldValues

`Record`\<`string`, `string` \| `number` \| `boolean` \| `null` \| `undefined`\>

Map of variable names and field IDs to values

### fieldsList

[`CRFField`](../../types/interfaces/CRFField.md)[]

Array of form fields for identifier resolution

## Returns

`number`

Evaluated numeric result

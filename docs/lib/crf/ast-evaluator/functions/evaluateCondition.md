[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/ast-evaluator](../README.md) / evaluateCondition

# Function: evaluateCondition()

> **evaluateCondition**(`condition`, `fieldValues`, `fieldsList`, `visitContext?`): `boolean`

Defined in: [lib/crf/ast-evaluator.ts:394](https://github.com/fderuiter/portfolio/blob/main/lib/crf/ast-evaluator.ts#L394)

Evaluate single AST condition

## Parameters

### condition

[`AstCondition`](../../types/interfaces/AstCondition.md)

The condition to evaluate

### fieldValues

`Record`\<`string`, `string` \| `number` \| `boolean` \| `null` \| `undefined`\>

Map of all field IDs and variable names to values

### fieldsList

[`CRFField`](../../types/interfaces/CRFField.md)[]

Array of fields

### visitContext?

`string`

Optional visit ID to resolve cross-visit variables

## Returns

`boolean`

Boolean result of condition

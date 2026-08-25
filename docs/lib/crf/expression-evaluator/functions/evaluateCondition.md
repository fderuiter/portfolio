[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/expression-evaluator](../README.md) / evaluateCondition

# Function: evaluateCondition()

> **evaluateCondition**(`condition`, `fieldValues`, `fieldsList`, `visitContext?`): `boolean`

Defined in: [lib/crf/expression-evaluator.ts:446](https://github.com/fderuiter/portfolio/blob/main/lib/crf/expression-evaluator.ts#L446)

Evaluate single AST condition

## Parameters

### condition

[`AstCondition`](../../types/interfaces/AstCondition.md)

### fieldValues

`Record`\<`string`, `string` \| `number` \| `boolean` \| `null` \| `undefined`\>

### fieldsList

[`CRFField`](../../types/interfaces/CRFField.md)[]

### visitContext?

`string`

## Returns

`boolean`

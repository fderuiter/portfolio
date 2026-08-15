[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/ast-evaluator](../README.md) / evaluateRule

# Function: evaluateRule()

> **evaluateRule**(`rule`, `fieldValues`, `fieldsList`, `visitContext?`): `boolean`

Defined in: [lib/crf/ast-evaluator.ts:469](https://github.com/fderuiter/portfolio/blob/main/lib/crf/ast-evaluator.ts#L469)

Evaluate full edit check rule conditions

## Parameters

### rule

[`EditCheckRule`](../../types/interfaces/EditCheckRule.md)

The rule to evaluate

### fieldValues

`Record`\<`string`, `string` \| `number` \| `boolean` \| `null` \| `undefined`\>

Map of field values

### fieldsList

[`CRFField`](../../types/interfaces/CRFField.md)[]

Array of fields

### visitContext?

`string`

Optional visit identifier

## Returns

`boolean`

Boolean result indicating if rule conditions are satisfied

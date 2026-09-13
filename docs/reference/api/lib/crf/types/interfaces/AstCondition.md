[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/types](../README.md) / AstCondition

# Interface: AstCondition

## Properties

### compareFieldId?

> `optional` **compareFieldId?**: `string`

Field/field discrepancy check (#540): compares fieldId's value against
this OTHER field's value instead of the literal `value`. Takes
precedence over `value` when set.

***

### crossVisitId?

> `optional` **crossVisitId?**: `string`

***

### fieldId

> **fieldId**: `string`

***

### operator

> **operator**: [`AstOperator`](../type-aliases/AstOperator.md)

***

### value

> **value**: `string` \| `number` \| `boolean` \| `string`[]

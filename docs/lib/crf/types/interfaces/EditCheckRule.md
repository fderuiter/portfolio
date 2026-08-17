[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/types](../README.md) / EditCheckRule

# Interface: EditCheckRule

Defined in: [lib/crf/types.ts:57](https://github.com/fderuiter/portfolio/blob/main/lib/crf/types.ts#L57)

## Properties

### actionType

> **actionType**: `"show_field"` \| `"hide_field"` \| `"require_field"` \| `"raise_query"` \| `"set_value"`

Defined in: [lib/crf/types.ts:62](https://github.com/fderuiter/portfolio/blob/main/lib/crf/types.ts#L62)

***

### conditions

> **conditions**: [`AstCondition`](AstCondition.md)[]

Defined in: [lib/crf/types.ts:64](https://github.com/fderuiter/portfolio/blob/main/lib/crf/types.ts#L64)

***

### description

> **description**: `string`

Defined in: [lib/crf/types.ts:60](https://github.com/fderuiter/portfolio/blob/main/lib/crf/types.ts#L60)

***

### formulaExpression?

> `optional` **formulaExpression?**: `string`

Defined in: [lib/crf/types.ts:68](https://github.com/fderuiter/portfolio/blob/main/lib/crf/types.ts#L68)

***

### id

> **id**: `string`

Defined in: [lib/crf/types.ts:58](https://github.com/fderuiter/portfolio/blob/main/lib/crf/types.ts#L58)

***

### logicalOperator

> **logicalOperator**: `"AND"` \| `"OR"`

Defined in: [lib/crf/types.ts:65](https://github.com/fderuiter/portfolio/blob/main/lib/crf/types.ts#L65)

***

### name

> **name**: `string`

Defined in: [lib/crf/types.ts:59](https://github.com/fderuiter/portfolio/blob/main/lib/crf/types.ts#L59)

***

### queryMessage?

> `optional` **queryMessage?**: `string`

Defined in: [lib/crf/types.ts:67](https://github.com/fderuiter/portfolio/blob/main/lib/crf/types.ts#L67)

***

### querySeverity?

> `optional` **querySeverity?**: `"error"` \| `"info"` \| `"warning"`

Defined in: [lib/crf/types.ts:66](https://github.com/fderuiter/portfolio/blob/main/lib/crf/types.ts#L66)

***

### targetFieldId

> **targetFieldId**: `string`

Defined in: [lib/crf/types.ts:63](https://github.com/fderuiter/portfolio/blob/main/lib/crf/types.ts#L63)

***

### triggerFieldIds

> **triggerFieldIds**: `string`[]

Defined in: [lib/crf/types.ts:61](https://github.com/fderuiter/portfolio/blob/main/lib/crf/types.ts#L61)

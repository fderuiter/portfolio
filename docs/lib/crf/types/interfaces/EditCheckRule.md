[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/types](../README.md) / EditCheckRule

# Interface: EditCheckRule

Defined in: [lib/crf/types.ts:68](https://github.com/fderuiter/portfolio/blob/main/lib/crf/types.ts#L68)

## Properties

### actionType

> **actionType**: `"show_field"` \| `"hide_field"` \| `"require_field"` \| `"raise_query"` \| `"set_value"`

Defined in: [lib/crf/types.ts:73](https://github.com/fderuiter/portfolio/blob/main/lib/crf/types.ts#L73)

***

### conditions

> **conditions**: [`AstCondition`](AstCondition.md)[]

Defined in: [lib/crf/types.ts:76](https://github.com/fderuiter/portfolio/blob/main/lib/crf/types.ts#L76)

***

### description

> **description**: `string`

Defined in: [lib/crf/types.ts:71](https://github.com/fderuiter/portfolio/blob/main/lib/crf/types.ts#L71)

***

### formulaExpression?

> `optional` **formulaExpression?**: `string`

Defined in: [lib/crf/types.ts:80](https://github.com/fderuiter/portfolio/blob/main/lib/crf/types.ts#L80)

***

### id

> **id**: `string`

Defined in: [lib/crf/types.ts:69](https://github.com/fderuiter/portfolio/blob/main/lib/crf/types.ts#L69)

***

### logicalOperator

> **logicalOperator**: `"AND"` \| `"OR"`

Defined in: [lib/crf/types.ts:77](https://github.com/fderuiter/portfolio/blob/main/lib/crf/types.ts#L77)

***

### name

> **name**: `string`

Defined in: [lib/crf/types.ts:70](https://github.com/fderuiter/portfolio/blob/main/lib/crf/types.ts#L70)

***

### queryMessage?

> `optional` **queryMessage?**: `string`

Defined in: [lib/crf/types.ts:79](https://github.com/fderuiter/portfolio/blob/main/lib/crf/types.ts#L79)

***

### querySeverity?

> `optional` **querySeverity?**: `"error"` \| `"warning"` \| `"info"`

Defined in: [lib/crf/types.ts:78](https://github.com/fderuiter/portfolio/blob/main/lib/crf/types.ts#L78)

***

### targetFieldId

> **targetFieldId**: `string`

Defined in: [lib/crf/types.ts:75](https://github.com/fderuiter/portfolio/blob/main/lib/crf/types.ts#L75)

***

### triggerFieldIds

> **triggerFieldIds**: `string`[]

Defined in: [lib/crf/types.ts:72](https://github.com/fderuiter/portfolio/blob/main/lib/crf/types.ts#L72)

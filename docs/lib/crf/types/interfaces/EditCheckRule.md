[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/types](../README.md) / EditCheckRule

# Interface: EditCheckRule

## Properties

### actionType

> **actionType**: `"show_field"` \| `"hide_field"` \| `"require_field"` \| `"raise_query"` \| `"set_value"`

***

### conditions

> **conditions**: [`AstCondition`](AstCondition.md)[]

***

### description

> **description**: `string`

***

### formulaExpression?

> `optional` **formulaExpression?**: `string`

***

### id

> **id**: `string`

***

### logicalOperator

> **logicalOperator**: `"AND"` \| `"OR"`

***

### name

> **name**: `string`

***

### queryMessage?

> `optional` **queryMessage?**: `string`

***

### querySeverity?

> `optional` **querySeverity?**: `"error"` \| `"warning"` \| `"info"`

***

### targetFieldId

> **targetFieldId**: `string`

***

### triggerFieldIds

> **triggerFieldIds**: `string`[]

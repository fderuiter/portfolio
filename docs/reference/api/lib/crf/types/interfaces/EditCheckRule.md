[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/types](../README.md) / EditCheckRule

# Interface: EditCheckRule

## Properties

### actionType

> **actionType**: `"show_field"` \| `"hide_field"` \| `"require_field"` \| `"raise_query"` \| `"set_value"`

***

### conditionGroups?

> `optional` **conditionGroups?**: [`ConditionGroup`](ConditionGroup.md)[]

Explicit AND/OR groups (#540). When present (non-empty), evaluation
uses these groups instead of the flat `conditions`/`logicalOperator`
pair, which is retained for backward compatibility with rules
authored, imported, or persisted before grouping existed.

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

### groupLogicalOperator?

> `optional` **groupLogicalOperator?**: `"AND"` \| `"OR"`

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

***

### unsupportedExpression?

> `optional` **unsupportedExpression?**: `object`

Preserves an imported expression this evaluator couldn't map onto
`conditions`/`conditionGroups` (unrecognized shape, not merely an
unrecognized operator) verbatim, rather than silently dropping or
simplifying it during import (#540). A rule carrying this never fires
automatically; it is surfaced to the author for review instead.

#### raw

> **raw**: `unknown`

#### reason

> **reason**: `string`

[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/types](../README.md) / ConditionGroup

# Interface: ConditionGroup

One AND/OR-homogeneous group of leaf conditions (#540). EditCheckRule can
combine several of these with its own groupLogicalOperator, giving
explicit two-level AND/OR grouping (e.g. "(A AND B) OR (C AND D)")
without unbounded recursive nesting.

## Properties

### conditions

> **conditions**: [`AstCondition`](AstCondition.md)[]

***

### id

> **id**: `string`

***

### logicalOperator

> **logicalOperator**: `"AND"` \| `"OR"`

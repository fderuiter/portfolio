[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/proof-utils](../README.md) / applyRuleToAsts

# Function: applyRuleToAsts()

> **applyRuleToAsts**(`ruleId`, `inputs`): `object`

Defined in: [lib/proof-utils.ts:1861](https://github.com/fderuiter/portfolio/blob/main/lib/proof-utils.ts#L1861)

Attempts to apply an inference rule to given AST premises and returns the derived AST.

## Parameters

### ruleId

`string`

### inputs

[`PropAst`](../type-aliases/PropAst.md)[]

## Returns

`object`

### explanation?

> `optional` **explanation?**: `string`

### resultAst?

> `optional` **resultAst?**: [`PropAst`](../type-aliases/PropAst.md)

### success

> **success**: `boolean`

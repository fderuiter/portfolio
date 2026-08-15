[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/proof-utils](../README.md) / evaluateAstWithTrace

# Function: evaluateAstWithTrace()

> **evaluateAstWithTrace**(`ast`, `env?`, `depth?`): [`AstTraceNode`](../interfaces/AstTraceNode.md)

Defined in: [lib/proof-utils.ts:461](https://github.com/fderuiter/portfolio/blob/main/lib/proof-utils.ts#L461)

Evaluates the boolean truth value of an AST under a variable valuation and produces a hierarchical evaluation trace.

## Parameters

### ast

[`PropAst`](../type-aliases/PropAst.md) \| `null` \| `undefined`

### env?

`Record`\<`string`, `boolean`\> = `{}`

### depth?

`number` = `0`

## Returns

[`AstTraceNode`](../interfaces/AstTraceNode.md)

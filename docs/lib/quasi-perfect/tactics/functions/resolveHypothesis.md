[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/quasi-perfect/tactics](../README.md) / resolveHypothesis

# Function: resolveHypothesis()

> **resolveHypothesis**(`hypotheses?`, `arg?`, `structuralPredicate?`): [`ASTNode`](../../types/interfaces/ASTNode.md) \| `undefined`

Defined in: [lib/quasi-perfect/tactics.ts:20](https://github.com/fderuiter/portfolio/blob/main/lib/quasi-perfect/tactics.ts#L20)

Resolves a hypothesis from context using LIFO (reverse array search) order.
Tier 1: Searches by metadata.name (case-insensitive) or node id in reverse order.
Tier 2: Structural predicate fallback searching in reverse order.

## Parameters

### hypotheses?

[`ASTNode`](../../types/interfaces/ASTNode.md)[] = `[]`

### arg?

`string`

### structuralPredicate?

(`h`) => `boolean`

## Returns

[`ASTNode`](../../types/interfaces/ASTNode.md) \| `undefined`

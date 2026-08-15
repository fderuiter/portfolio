[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/proof-utils](../README.md) / canConnect

# Function: canConnect()

> **canConnect**(`sourceId`, `targetId`, `edges`, `theoremId?`): `object`

Defined in: [lib/proof-utils.ts:2168](https://github.com/fderuiter/portfolio/blob/main/lib/proof-utils.ts#L2168)

Checks if two nodes can be connected logically and returns validation status.

## Parameters

### sourceId

`string`

### targetId

`string`

### edges

[`Edge`](../interfaces/Edge.md)[]

### theoremId?

[`TheoremId`](../type-aliases/TheoremId.md) = `"modus-ponens"`

## Returns

`object`

### allowed

> **allowed**: `boolean`

### reason?

> `optional` **reason?**: `string`

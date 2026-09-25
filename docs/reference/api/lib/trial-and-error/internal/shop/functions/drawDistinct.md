[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/shop](../README.md) / drawDistinct

# Function: drawDistinct()

> **drawDistinct**\<`T`\>(`seed`, `drawIndex`, `pool`, `count`): `object`

Draws up to `count` distinct items from `pool` without replacement on the
shop stream, starting at `drawIndex`. Consumes one draw per item taken.

## Type Parameters

### T

`T`

## Parameters

### seed

`string`

### drawIndex

`number`

### pool

readonly `T`[]

### count

`number`

## Returns

`object`

### items

> **items**: `T`[]

### next

> **next**: `number`

[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/masonry](../README.md) / calculateMasonryLayout

# Function: calculateMasonryLayout()

> **calculateMasonryLayout**\<`T`\>(`containerWidth`, `filteredItems`, `preparedData`, `config`, `heightOverrides?`): `object`

Defined in: [lib/masonry.ts:79](https://github.com/fderuiter/portfolio/blob/main/lib/masonry.ts#L79)

## Type Parameters

### T

`T` *extends* `object`

## Parameters

### containerWidth

`number`

### filteredItems

`T`[]

### preparedData

`Record`\<`string`, [`PreparedData`](../interfaces/PreparedData.md)\>

### config

[`MasonryConfig`](../interfaces/MasonryConfig.md)

### heightOverrides?

`Record`\<`string`, `number`\>

## Returns

`object`

### colCount

> **colCount**: `number`

### columns

> **columns**: (`T` & `object` \| `T` & `object`)[][]

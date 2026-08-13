[**temp_dir**](../../../README.md)

***

[temp_dir](../../../modules.md) / [lib/masonry](../README.md) / calculateMasonryLayout

# Function: calculateMasonryLayout()

> **calculateMasonryLayout**\<`T`\>(`containerWidth`, `filteredItems`, `preparedData`, `config`, `heightOverrides?`): `object`

Defined in: [lib/masonry.ts:29](https://github.com/fderuiter/portfolio/blob/e9125b13b4fd502f929719e363744f8eb92647bc/lib/masonry.ts#L29)

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

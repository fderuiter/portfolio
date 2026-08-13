[**temp_dir**](../../../README.md)

***

[temp_dir](../../../modules.md) / [hooks/useMasonryLayout](../README.md) / useMasonryLayout

# Function: useMasonryLayout()

> **useMasonryLayout**\<`T`\>(`allItems`, `filteredItems`): `object`

Defined in: [hooks/useMasonryLayout.ts:31](https://github.com/fderuiter/portfolio/blob/e9125b13b4fd502f929719e363744f8eb92647bc/hooks/useMasonryLayout.ts#L31)

## Type Parameters

### T

`T` *extends* [`MasonryItem`](../interfaces/MasonryItem.md)

## Parameters

### allItems

`T`[]

### filteredItems

`T`[]

## Returns

`object`

### containerRef

> **containerRef**: `RefObject`\<`HTMLDivElement` \| `null`\>

### layoutState

> **layoutState**: `object`

#### layoutState.colCount

> **colCount**: `number`

#### layoutState.columns

> **columns**: `T` & `object`[][]

#### layoutState.isReady

> **isReady**: `boolean`

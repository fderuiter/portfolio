[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/safe-storage](../README.md) / setItem

# Function: setItem()

> **setItem**\<`T`\>(`key`, `value`, `options?`): `boolean`

Defined in: [lib/safe-storage.ts:420](https://github.com/fderuiter/portfolio/blob/main/lib/safe-storage.ts#L420)

Stores a key-value pair wrapped in a metadata envelope, with quota pre-checks, automated LRU eviction, and memory fallback.

## Type Parameters

### T

`T` = `unknown`

## Parameters

### key

`string`

### value

`T`

### options?

[`SetItemOptions`](../interfaces/SetItemOptions.md)

## Returns

`boolean`

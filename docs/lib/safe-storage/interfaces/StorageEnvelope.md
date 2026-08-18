[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/safe-storage](../README.md) / StorageEnvelope

# Interface: StorageEnvelope\<T\>

Defined in: [lib/safe-storage.ts:10](https://github.com/fderuiter/portfolio/blob/main/lib/safe-storage.ts#L10)

Metadata envelope wrapping values stored via safeStorage.
Tracks creation/access timestamps, optional expiration parameters, and LRU eviction flags.

## Type Parameters

### T

`T` = `unknown`

## Properties

### expirable?

> `optional` **expirable?**: `boolean`

Defined in: [lib/safe-storage.ts:14](https://github.com/fderuiter/portfolio/blob/main/lib/safe-storage.ts#L14)

***

### expiresAt?

> `optional` **expiresAt?**: `number` \| `null`

Defined in: [lib/safe-storage.ts:13](https://github.com/fderuiter/portfolio/blob/main/lib/safe-storage.ts#L13)

***

### timestamp

> **timestamp**: `number`

Defined in: [lib/safe-storage.ts:12](https://github.com/fderuiter/portfolio/blob/main/lib/safe-storage.ts#L12)

***

### v?

> `optional` **v?**: `number`

Defined in: [lib/safe-storage.ts:15](https://github.com/fderuiter/portfolio/blob/main/lib/safe-storage.ts#L15)

***

### value

> **value**: `T`

Defined in: [lib/safe-storage.ts:11](https://github.com/fderuiter/portfolio/blob/main/lib/safe-storage.ts#L11)

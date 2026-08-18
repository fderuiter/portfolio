[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/safe-storage](../README.md) / SafeStorageErrorDetail

# Interface: SafeStorageErrorDetail

Defined in: [lib/safe-storage.ts:31](https://github.com/fderuiter/portfolio/blob/main/lib/safe-storage.ts#L31)

Error detail interface dispatched on safe storage errors.

## Properties

### action

> **action**: `"getItem"` \| `"setItem"` \| `"removeItem"` \| `"clear"` \| `"evictLRU"`

Defined in: [lib/safe-storage.ts:33](https://github.com/fderuiter/portfolio/blob/main/lib/safe-storage.ts#L33)

***

### key?

> `optional` **key?**: `string`

Defined in: [lib/safe-storage.ts:32](https://github.com/fderuiter/portfolio/blob/main/lib/safe-storage.ts#L32)

***

### message

> **message**: `string`

Defined in: [lib/safe-storage.ts:34](https://github.com/fderuiter/portfolio/blob/main/lib/safe-storage.ts#L34)

***

### sanitizedError

> **sanitizedError**: `string` \| `Error`

Defined in: [lib/safe-storage.ts:35](https://github.com/fderuiter/portfolio/blob/main/lib/safe-storage.ts#L35)

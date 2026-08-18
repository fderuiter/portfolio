[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/safe-storage](../README.md) / StorageOptions

# Interface: StorageOptions

Defined in: [lib/safe-storage.ts:6](https://github.com/fderuiter/portfolio/blob/main/lib/safe-storage.ts#L6)

## Properties

### expiresAt?

> `optional` **expiresAt?**: `number` \| `null`

Defined in: [lib/safe-storage.ts:8](https://github.com/fderuiter/portfolio/blob/main/lib/safe-storage.ts#L8)

Optional Unix timestamp (in milliseconds) after which the item is considered expired

***

### isExpirable?

> `optional` **isExpirable?**: `boolean`

Defined in: [lib/safe-storage.ts:10](https://github.com/fderuiter/portfolio/blob/main/lib/safe-storage.ts#L10)

Flag indicating whether this key can be automatically evicted under quota pressure

***

### ttlMs?

> `optional` **ttlMs?**: `number`

Defined in: [lib/safe-storage.ts:12](https://github.com/fderuiter/portfolio/blob/main/lib/safe-storage.ts#L12)

Optional time-to-live duration in milliseconds

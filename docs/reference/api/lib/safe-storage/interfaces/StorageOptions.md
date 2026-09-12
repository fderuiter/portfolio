[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/safe-storage](../README.md) / StorageOptions

# Interface: StorageOptions

## Properties

### expiresAt?

> `optional` **expiresAt?**: `number` \| `null`

Optional Unix timestamp (in milliseconds) after which the item is considered expired

***

### isExpirable?

> `optional` **isExpirable?**: `boolean`

Flag indicating whether this key can be automatically evicted under quota pressure

***

### ttlMs?

> `optional` **ttlMs?**: `number`

Optional time-to-live duration in milliseconds

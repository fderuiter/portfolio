[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/safe-storage](../README.md) / SafeStorageAdapter

# Class: SafeStorageAdapter

## Constructors

### Constructor

> **new SafeStorageAdapter**(): `SafeStorageAdapter`

#### Returns

`SafeStorageAdapter`

## Accessors

### length

#### Get Signature

> **get** **length**(): `number`

Gets total number of stored keys.

##### Returns

`number`

## Methods

### clear()

> **clear**(): `void`

Clears all items from storage and memory cache.

#### Returns

`void`

***

### clearCache()

> **clearCache**(): `void`

Clear all internal memory cache entries.

#### Returns

`void`

***

### getEnvelope()

> **getEnvelope**\<`T`\>(`key`): [`StorageEnvelope`](../interfaces/StorageEnvelope.md)\<`T`\> \| `null`

Gets the metadata envelope for a key if present or constructs default metadata.

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### key

`string`

#### Returns

[`StorageEnvelope`](../interfaces/StorageEnvelope.md)\<`T`\> \| `null`

***

### getItem()

> **getItem**\<`T`\>(`key`, `defaultValue?`): `T` \| `null`

Reads an item from storage or memory fallback cache.
Updates lastAccessedAt timestamp and auto-evicts expired items.

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### key

`string`

##### defaultValue?

`T`

#### Returns

`T` \| `null`

***

### invalidateCacheKey()

> **invalidateCacheKey**(`key`): `void`

Invalidate memory cache key if raw storage content differs.

#### Parameters

##### key

`string`

#### Returns

`void`

***

### isAvailable()

> **isAvailable**(): `boolean`

Safely checks whether localStorage API is accessible in the current environment.

#### Returns

`boolean`

***

### key()

> **key**(`index`): `string` \| `null`

Returns key at specified index.

#### Parameters

##### index

`number`

#### Returns

`string` \| `null`

***

### pruneExpired()

> **pruneExpired**(): `number`

Prunes all expired keys across storage and memory cache.
Returns count of pruned entries.

#### Returns

`number`

***

### removeItem()

> **removeItem**(`key`): `void`

Removes an item from storage and memory cache.

#### Parameters

##### key

`string`

#### Returns

`void`

***

### setItem()

> **setItem**\<`T`\>(`key`, `value`, `options?`): `boolean`

Writes an item wrapped in a metadata envelope to storage.
Handles QuotaExceededError by triggering LRU metadata eviction.

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### key

`string`

##### value

`T`

##### options?

[`StorageOptions`](../interfaces/StorageOptions.md)

#### Returns

`boolean`

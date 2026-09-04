[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/safe-storage](../README.md) / SafeStorageAdapter

# Class: SafeStorageAdapter

Defined in: [lib/safe-storage.ts:28](https://github.com/fderuiter/portfolio/blob/main/lib/safe-storage.ts#L28)

## Constructors

### Constructor

> **new SafeStorageAdapter**(): `SafeStorageAdapter`

Defined in: [lib/safe-storage.ts:31](https://github.com/fderuiter/portfolio/blob/main/lib/safe-storage.ts#L31)

#### Returns

`SafeStorageAdapter`

## Accessors

### length

#### Get Signature

> **get** **length**(): `number`

Defined in: [lib/safe-storage.ts:295](https://github.com/fderuiter/portfolio/blob/main/lib/safe-storage.ts#L295)

Gets total number of stored keys.

##### Returns

`number`

## Methods

### clear()

> **clear**(): `void`

Defined in: [lib/safe-storage.ts:263](https://github.com/fderuiter/portfolio/blob/main/lib/safe-storage.ts#L263)

Clears all items from storage and memory cache.

#### Returns

`void`

***

### clearCache()

> **clearCache**(): `void`

Defined in: [lib/safe-storage.ts:88](https://github.com/fderuiter/portfolio/blob/main/lib/safe-storage.ts#L88)

Clear all internal memory cache entries.

#### Returns

`void`

***

### getEnvelope()

> **getEnvelope**\<`T`\>(`key`): [`StorageEnvelope`](../interfaces/StorageEnvelope.md)\<`T`\> \| `null`

Defined in: [lib/safe-storage.ts:309](https://github.com/fderuiter/portfolio/blob/main/lib/safe-storage.ts#L309)

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

Defined in: [lib/safe-storage.ts:96](https://github.com/fderuiter/portfolio/blob/main/lib/safe-storage.ts#L96)

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

Defined in: [lib/safe-storage.ts:70](https://github.com/fderuiter/portfolio/blob/main/lib/safe-storage.ts#L70)

Invalidate memory cache key if raw storage content differs.

#### Parameters

##### key

`string`

#### Returns

`void`

***

### isAvailable()

> **isAvailable**(): `boolean`

Defined in: [lib/safe-storage.ts:53](https://github.com/fderuiter/portfolio/blob/main/lib/safe-storage.ts#L53)

Safely checks whether localStorage API is accessible in the current environment.

#### Returns

`boolean`

***

### key()

> **key**(`index`): `string` \| `null`

Defined in: [lib/safe-storage.ts:281](https://github.com/fderuiter/portfolio/blob/main/lib/safe-storage.ts#L281)

Returns key at specified index.

#### Parameters

##### index

`number`

#### Returns

`string` \| `null`

***

### pruneExpired()

> **pruneExpired**(): `number`

Defined in: [lib/safe-storage.ts:343](https://github.com/fderuiter/portfolio/blob/main/lib/safe-storage.ts#L343)

Prunes all expired keys across storage and memory cache.
Returns count of pruned entries.

#### Returns

`number`

***

### removeItem()

> **removeItem**(`key`): `void`

Defined in: [lib/safe-storage.ts:242](https://github.com/fderuiter/portfolio/blob/main/lib/safe-storage.ts#L242)

Removes an item from storage and memory cache.

#### Parameters

##### key

`string`

#### Returns

`void`

***

### setItem()

> **setItem**\<`T`\>(`key`, `value`, `options?`): `boolean`

Defined in: [lib/safe-storage.ts:185](https://github.com/fderuiter/portfolio/blob/main/lib/safe-storage.ts#L185)

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

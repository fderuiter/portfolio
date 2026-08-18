[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/safe-storage](../README.md) / safeStorage

# Variable: safeStorage

> `const` **safeStorage**: `object`

Defined in: [lib/safe-storage.ts:544](https://github.com/fderuiter/portfolio/blob/main/lib/safe-storage.ts#L544)

Centralized Safe Storage Utility instance.

## Type Declaration

### clear

> **clear**: () => `void`

Clears all managed keys from local storage and in-memory fallback cache.

#### Returns

`void`

### evictLRU

> **evictLRU**: (`bytesNeeded`) => `number`

Perform LRU eviction of expired items and non-critical data keys to free storage space.

#### Parameters

##### bytesNeeded?

`number` = `0`

#### Returns

`number`

### getEnvelope

> **getEnvelope**: \<`T`\>(`key`) => [`StorageEnvelope`](../interfaces/StorageEnvelope.md)\<`T`\> \| `null`

Retrieves raw envelope metadata for a key for debugging and diagnostic inspection.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### key

`string`

#### Returns

[`StorageEnvelope`](../interfaces/StorageEnvelope.md)\<`T`\> \| `null`

### getItem

> **getItem**: \<`T`\>(`key`, `defaultValue`) => `T` \| `null`

Retrieves value from local storage with envelope metadata inspection, expiration check, and memory fallback.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### key

`string`

##### defaultValue?

`T` \| `null`

#### Returns

`T` \| `null`

### isCacheOrTelemetryKey

> **isCacheOrTelemetryKey**: (`key`) => `boolean`

Check if key matches known cache or telemetry log patterns.

#### Parameters

##### key

`string`

#### Returns

`boolean`

### isStorageAvailable

> **isStorageAvailable**: () => `boolean`

Evaluates whether browser localStorage is accessible and writable without throwing quota or security errors.

#### Returns

`boolean`

### isUserPreferenceKey

> **isUserPreferenceKey**: (`key`) => `boolean`

Check if user preference key should be protected from LRU eviction.

#### Parameters

##### key

`string`

#### Returns

`boolean`

### onError

> **onError**: (`listener`) => () => `void`

Subscribes an error listener function to safe storage error/quota failure events.

#### Parameters

##### listener

[`StorageErrorListener`](../type-aliases/StorageErrorListener.md)

#### Returns

() => `void`

### removeItem

> **removeItem**: (`key`) => `void`

Removes a key from both local storage and in-memory fallback cache.

#### Parameters

##### key

`string`

#### Returns

`void`

### setItem

> **setItem**: \<`T`\>(`key`, `value`, `options?`) => `boolean`

Stores a key-value pair wrapped in a metadata envelope, with quota pre-checks, automated LRU eviction, and memory fallback.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### key

`string`

##### value

`T`

##### options?

[`SetItemOptions`](../interfaces/SetItemOptions.md)

#### Returns

`boolean`

### subscribe

> **subscribe**: (`callback`) => () => `void`

Subscribes a listener function to safe storage mutation events.

#### Parameters

##### callback

() => `void`

#### Returns

() => `void`

[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/arcade/core/pool](../README.md) / ObjectPool

# Class: ObjectPool\<T\>

Defined in: lib/arcade/core/pool.ts:16

## Type Parameters

### T

`T`

## Constructors

### Constructor

> **new ObjectPool**\<`T`\>(`config`): `ObjectPool`\<`T`\>

Defined in: lib/arcade/core/pool.ts:26

#### Parameters

##### config

[`ObjectPoolConfig`](../interfaces/ObjectPoolConfig.md)\<`T`\>

#### Returns

`ObjectPool`\<`T`\>

## Methods

### acquire()

> **acquire**(): `T` \| `null`

Defined in: lib/arcade/core/pool.ts:44

Acquires an inactive object from the pool, or recycles/expands according to policy.

#### Returns

`T` \| `null`

***

### clear()

> **clear**(): `void`

Defined in: lib/arcade/core/pool.ts:101

#### Returns

`void`

***

### forEachActive()

> **forEachActive**(`callback`): `void`

Defined in: lib/arcade/core/pool.ts:87

Iterates through all currently active items in the pool.

#### Parameters

##### callback

(`item`, `index`) => `void`

#### Returns

`void`

***

### getActiveCount()

> **getActiveCount**(): `number`

Defined in: lib/arcade/core/pool.ts:93

#### Returns

`number`

***

### getCapacity()

> **getCapacity**(): `number`

Defined in: lib/arcade/core/pool.ts:97

#### Returns

`number`

***

### release()

> **release**(`item`): `void`

Defined in: lib/arcade/core/pool.ts:75

Releases an active object back to the pool.

#### Parameters

##### item

`T`

#### Returns

`void`

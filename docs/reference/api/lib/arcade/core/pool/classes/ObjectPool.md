[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/arcade/core/pool](../README.md) / ObjectPool

# Class: ObjectPool\<T\>

## Type Parameters

### T

`T`

## Constructors

### Constructor

> **new ObjectPool**\<`T`\>(`config`): `ObjectPool`\<`T`\>

#### Parameters

##### config

[`ObjectPoolConfig`](../interfaces/ObjectPoolConfig.md)\<`T`\>

#### Returns

`ObjectPool`\<`T`\>

## Methods

### acquire()

> **acquire**(): `T` \| `null`

Acquires an inactive object from the pool, or recycles/expands according to policy.

#### Returns

`T` \| `null`

***

### clear()

> **clear**(): `void`

#### Returns

`void`

***

### forEachActive()

> **forEachActive**(`callback`): `void`

Iterates through all currently active items in the pool.

#### Parameters

##### callback

(`item`, `index`) => `void`

#### Returns

`void`

***

### getActiveCount()

> **getActiveCount**(): `number`

#### Returns

`number`

***

### getCapacity()

> **getCapacity**(): `number`

#### Returns

`number`

***

### release()

> **release**(`item`): `void`

Releases an active object back to the pool.

#### Parameters

##### item

`T`

#### Returns

`void`

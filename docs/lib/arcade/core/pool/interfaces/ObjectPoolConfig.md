[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/arcade/core/pool](../README.md) / ObjectPoolConfig

# Interface: ObjectPoolConfig\<T\>

Defined in: lib/arcade/core/pool.ts:8

## Type Parameters

### T

`T`

## Properties

### factory

> **factory**: () => `T`

Defined in: lib/arcade/core/pool.ts:9

#### Returns

`T`

***

### initialCapacity

> **initialCapacity**: `number`

Defined in: lib/arcade/core/pool.ts:11

***

### maxCapacity?

> `optional` **maxCapacity?**: `number`

Defined in: lib/arcade/core/pool.ts:12

***

### overflowPolicy?

> `optional` **overflowPolicy?**: [`PoolOverflowPolicy`](../type-aliases/PoolOverflowPolicy.md)

Defined in: lib/arcade/core/pool.ts:13

***

### reset

> **reset**: (`item`) => `void`

Defined in: lib/arcade/core/pool.ts:10

#### Parameters

##### item

`T`

#### Returns

`void`

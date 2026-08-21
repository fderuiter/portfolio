[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/arcade/core/pool](../README.md) / ObjectPoolConfig

# Interface: ObjectPoolConfig\<T\>

Defined in: [lib/arcade/core/pool.ts:8](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/pool.ts#L8)

## Type Parameters

### T

`T`

## Properties

### factory

> **factory**: () => `T`

Defined in: [lib/arcade/core/pool.ts:9](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/pool.ts#L9)

#### Returns

`T`

***

### initialCapacity

> **initialCapacity**: `number`

Defined in: [lib/arcade/core/pool.ts:11](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/pool.ts#L11)

***

### maxCapacity?

> `optional` **maxCapacity?**: `number`

Defined in: [lib/arcade/core/pool.ts:12](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/pool.ts#L12)

***

### overflowPolicy?

> `optional` **overflowPolicy?**: [`PoolOverflowPolicy`](../type-aliases/PoolOverflowPolicy.md)

Defined in: [lib/arcade/core/pool.ts:13](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/pool.ts#L13)

***

### reset

> **reset**: (`item`) => `void`

Defined in: [lib/arcade/core/pool.ts:10](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/pool.ts#L10)

#### Parameters

##### item

`T`

#### Returns

`void`

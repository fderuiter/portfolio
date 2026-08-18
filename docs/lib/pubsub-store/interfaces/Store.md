[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/pubsub-store](../README.md) / Store

# Interface: Store\<T\>

Defined in: [lib/pubsub-store.ts:7](https://github.com/fderuiter/portfolio/blob/main/lib/pubsub-store.ts#L7)

## Type Parameters

### T

`T`

## Properties

### get

> **get**: () => `T`

Defined in: [lib/pubsub-store.ts:8](https://github.com/fderuiter/portfolio/blob/main/lib/pubsub-store.ts#L8)

#### Returns

`T`

***

### set

> **set**: (`nextState`) => `void`

Defined in: [lib/pubsub-store.ts:9](https://github.com/fderuiter/portfolio/blob/main/lib/pubsub-store.ts#L9)

#### Parameters

##### nextState

`Partial`\<`T`\> \| ((`prev`) => `T`)

#### Returns

`void`

***

### subscribe

> **subscribe**: (`listener`) => () => `void`

Defined in: [lib/pubsub-store.ts:10](https://github.com/fderuiter/portfolio/blob/main/lib/pubsub-store.ts#L10)

#### Parameters

##### listener

`Listener`

#### Returns

() => `void`

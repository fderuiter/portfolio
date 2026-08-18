[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/pubsub-store](../README.md) / createStore

# Function: createStore()

> **createStore**\<`T`\>(`initialState`): [`Store`](../interfaces/Store.md)\<`T`\>

Defined in: [lib/pubsub-store.ts:18](https://github.com/fderuiter/portfolio/blob/main/lib/pubsub-store.ts#L18)

Creates a zero-dependency external pub-sub store.
Allows components to subscribe to fine-grained state updates
without causing top-down React re-render cascades across parent trees.

## Type Parameters

### T

`T`

## Parameters

### initialState

`T`

## Returns

[`Store`](../interfaces/Store.md)\<`T`\>

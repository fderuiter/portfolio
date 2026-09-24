[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dx/chunk-cycle-guard](../README.md) / ChunkCycleChunkLike

# Interface: ChunkCycleChunkLike

A webpack chunk, reduced to what the runtime-cycle analysis reads.

## Properties

### id?

> `optional` **id?**: `string` \| `number` \| `null`

***

### name?

> `optional` **name?**: `string` \| `null`

## Methods

### getAllReferencedAsyncEntrypoints()

> **getAllReferencedAsyncEntrypoints**(): `Iterable`\<[`ChunkCycleEntrypointLike`](ChunkCycleEntrypointLike.md)\>

#### Returns

`Iterable`\<[`ChunkCycleEntrypointLike`](ChunkCycleEntrypointLike.md)\>

***

### hasRuntime()

> **hasRuntime**(): `boolean`

#### Returns

`boolean`

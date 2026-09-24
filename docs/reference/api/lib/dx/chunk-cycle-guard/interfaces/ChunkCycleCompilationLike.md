[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dx/chunk-cycle-guard](../README.md) / ChunkCycleCompilationLike

# Interface: ChunkCycleCompilationLike

A webpack compilation, reduced to what the plugin reads and writes.

## Properties

### chunkGraph?

> `optional` **chunkGraph?**: `object`

#### getChunkEntryModulesIterable()

> **getChunkEntryModulesIterable**(`chunk`): `Iterable`\<[`ChunkCycleModuleLike`](ChunkCycleModuleLike.md)\>

##### Parameters

###### chunk

[`ChunkCycleChunkLike`](ChunkCycleChunkLike.md)

##### Returns

`Iterable`\<[`ChunkCycleModuleLike`](ChunkCycleModuleLike.md)\>

***

### chunks

> **chunks**: `Iterable`\<[`ChunkCycleChunkLike`](ChunkCycleChunkLike.md)\>

***

### errors

> **errors**: `unknown`[]

***

### hooks

> **hooks**: `object`

#### afterSeal

> **afterSeal**: `object`

##### afterSeal.tap()

> **tap**(`name`, `callback`): `void`

###### Parameters

###### name

`string`

###### callback

() => `void`

###### Returns

`void`

***

### warnings

> **warnings**: `object`[]

#### message

> **message**: `string`

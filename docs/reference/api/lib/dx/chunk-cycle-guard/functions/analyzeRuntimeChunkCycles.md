[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dx/chunk-cycle-guard](../README.md) / analyzeRuntimeChunkCycles

# Function: analyzeRuntimeChunkCycles()

> **analyzeRuntimeChunkCycles**(`compilation`, `context?`): [`RuntimeChunkCycle`](../interfaces/RuntimeChunkCycle.md)[]

Builds the runtime chunk graph from a sealed compilation and returns every
cycle in it with enough detail to find the code responsible. Mirrors the
edges webpack itself uses in `Compilation#createHash`: runtime chunk to the
runtime chunk of each async entrypoint it can reach.

## Parameters

### compilation

[`ChunkCycleCompilationLike`](../interfaces/ChunkCycleCompilationLike.md)

### context?

`string`

## Returns

[`RuntimeChunkCycle`](../interfaces/RuntimeChunkCycle.md)[]

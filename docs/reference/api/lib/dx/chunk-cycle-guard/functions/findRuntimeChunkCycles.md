[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dx/chunk-cycle-guard](../README.md) / findRuntimeChunkCycles

# Function: findRuntimeChunkCycles()

> **findRuntimeChunkCycles**(`graph`): `string`[][]

Finds every cycle in a runtime chunk graph: each strongly connected component
with more than one chunk, and each chunk that references itself. Uses
Tarjan's algorithm so that a large graph is analysed in linear time, and
returns components sorted for deterministic output.

## Parameters

### graph

[`RuntimeChunkGraph`](../type-aliases/RuntimeChunkGraph.md)

## Returns

`string`[][]

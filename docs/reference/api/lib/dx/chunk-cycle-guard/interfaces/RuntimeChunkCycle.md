[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dx/chunk-cycle-guard](../README.md) / RuntimeChunkCycle

# Interface: RuntimeChunkCycle

A strongly connected set of runtime chunks, i.e. one cycle to break.

## Properties

### chunks

> **chunks**: `string`[]

Chunk labels in the cycle, sorted.

***

### edges

> **edges**: [`RuntimeChunkEdge`](RuntimeChunkEdge.md)[]

Edges that stay inside the cycle.

***

### entryModules

> **entryModules**: `Record`\<`string`, `string`[]\>

Entry modules of each chunk in the cycle, keyed by chunk label.

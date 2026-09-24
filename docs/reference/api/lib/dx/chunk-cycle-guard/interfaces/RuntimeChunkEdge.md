[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dx/chunk-cycle-guard](../README.md) / RuntimeChunkEdge

# Interface: RuntimeChunkEdge

One edge between runtime chunks: `from` can start the async entrypoint whose runtime is `to`.

## Properties

### from

> **from**: `string`

***

### to

> **to**: `string`

***

### via

> **via**: `string`[]

Who requested the async entrypoint, e.g. `lib/a.ts requests "./worker.ts"`.

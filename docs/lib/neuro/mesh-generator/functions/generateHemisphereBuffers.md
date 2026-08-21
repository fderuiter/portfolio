[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/neuro/mesh-generator](../README.md) / generateHemisphereBuffers

# Function: generateHemisphereBuffers()

> **generateHemisphereBuffers**(`hemi`, `mode`): [`HemisphereBufferTransfer`](../../types/interfaces/HemisphereBufferTransfer.md)

Defined in: [lib/neuro/mesh-generator.ts:131](https://github.com/fderuiter/portfolio/blob/main/lib/neuro/mesh-generator.ts#L131)

Generate raw typed array buffers for a single hemisphere (Left or Right)
Executes 12,500+ vertex spatial point checks, trigonometric folding calculations,
and Desikan-Killiany atlas parcellations into Float32Array and Uint32Array structures.

## Parameters

### hemi

`"left"` \| `"right"`

### mode

[`SurfaceMode`](../../types/type-aliases/SurfaceMode.md)

## Returns

[`HemisphereBufferTransfer`](../../types/interfaces/HemisphereBufferTransfer.md)

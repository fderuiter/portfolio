[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/neuro/asset-loader](../README.md) / loadExternalBrainMesh

# Function: loadExternalBrainMesh()

> **loadExternalBrainMesh**(`modelUrl`, `mode?`, `hemiFilter?`): `Promise`\<`Group`\<`Object3DEventMap`\>\>

Defined in: [lib/neuro/asset-loader.ts:19](https://github.com/fderuiter/portfolio/blob/main/lib/neuro/asset-loader.ts#L19)

Load external 3D brain mesh model (.glb, .gltf, or .obj) with automatic centering and scale normalization.
Network requests are scheduled via mediaScheduler to prevent initial load network contention.

## Parameters

### modelUrl

`string`

### mode?

[`SurfaceMode`](../../types/type-aliases/SurfaceMode.md) = `"pial"`

### hemiFilter?

[`HemisphereFilter`](../../types/type-aliases/HemisphereFilter.md) = `"both"`

## Returns

`Promise`\<`Group`\<`Object3DEventMap`\>\>

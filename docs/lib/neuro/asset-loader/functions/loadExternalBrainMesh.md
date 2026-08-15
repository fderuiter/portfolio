[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/neuro/asset-loader](../README.md) / loadExternalBrainMesh

# Function: loadExternalBrainMesh()

> **loadExternalBrainMesh**(`modelUrl`, `mode?`): `Promise`\<`Group`\<`Object3DEventMap`\>\>

Defined in: [lib/neuro/asset-loader.ts:17](https://github.com/fderuiter/portfolio/blob/main/lib/neuro/asset-loader.ts#L17)

Load external 3D brain mesh model (.glb, .gltf, or .obj) with automatic centering and scale normalization.

## Parameters

### modelUrl

`string`

### mode?

[`SurfaceMode`](../../types/type-aliases/SurfaceMode.md) = `"pial"`

## Returns

`Promise`\<`Group`\<`Object3DEventMap`\>\>

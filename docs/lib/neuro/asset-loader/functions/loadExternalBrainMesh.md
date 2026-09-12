[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/neuro/asset-loader](../README.md) / loadExternalBrainMesh

# Function: loadExternalBrainMesh()

> **loadExternalBrainMesh**(`modelUrl`, `mode?`, `hemiFilter?`): `Promise`\<`Group`\<`Object3DEventMap`\>\>

Convenience wrapper returning THREE.Group scene object constructed on-demand from raw geometry buffers.

## Parameters

### modelUrl

`string`

### mode?

[`SurfaceMode`](../../types/type-aliases/SurfaceMode.md) = `"pial"`

### hemiFilter?

[`HemisphereFilter`](../../types/type-aliases/HemisphereFilter.md) = `"both"`

## Returns

`Promise`\<`Group`\<`Object3DEventMap`\>\>

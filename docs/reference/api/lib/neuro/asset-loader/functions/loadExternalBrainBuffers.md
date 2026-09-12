[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/neuro/asset-loader](../README.md) / loadExternalBrainBuffers

# Function: loadExternalBrainBuffers()

> **loadExternalBrainBuffers**(`modelUrl`, `mode?`, `hemiFilter?`): `Promise`\<[`RawGeometryBuffer`](../../types/interfaces/RawGeometryBuffer.md)[]\>

Load external 3D brain model (.glb, .gltf, or .obj) and extract raw vertex and index data buffers.
Stores raw geometry buffers in persistent module memory rather than live engine scene objects.

## Parameters

### modelUrl

`string`

### mode?

[`SurfaceMode`](../../types/type-aliases/SurfaceMode.md) = `"pial"`

### hemiFilter?

[`HemisphereFilter`](../../types/type-aliases/HemisphereFilter.md) = `"both"`

## Returns

`Promise`\<[`RawGeometryBuffer`](../../types/interfaces/RawGeometryBuffer.md)[]\>

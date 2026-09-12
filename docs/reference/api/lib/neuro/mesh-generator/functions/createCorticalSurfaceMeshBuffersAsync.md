[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/neuro/mesh-generator](../README.md) / createCorticalSurfaceMeshBuffersAsync

# Function: createCorticalSurfaceMeshBuffersAsync()

> **createCorticalSurfaceMeshBuffersAsync**(`mode?`, `wireframe?`, `hemiFilter?`): `Promise`\<[`RawGeometryBuffer`](../../types/interfaces/RawGeometryBuffer.md)[]\>

Offloads vertex spatial point checks and Desikan-Killiany atlas parcellations
to a background Web Worker thread, returning raw binary ArrayBuffers via zero-copy transfers.

## Parameters

### mode?

[`SurfaceMode`](../../types/type-aliases/SurfaceMode.md) = `"pial"`

### wireframe?

`boolean` = `false`

### hemiFilter?

[`HemisphereFilter`](../../types/type-aliases/HemisphereFilter.md) = `"both"`

## Returns

`Promise`\<[`RawGeometryBuffer`](../../types/interfaces/RawGeometryBuffer.md)[]\>

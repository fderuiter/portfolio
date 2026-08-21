[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/neuro/mesh-generator](../README.md) / createCorticalSurfaceMeshBuffers

# Function: createCorticalSurfaceMeshBuffers()

> **createCorticalSurfaceMeshBuffers**(`mode?`, `wireframe?`, `hemiFilter?`): [`RawGeometryBuffer`](../../types/interfaces/RawGeometryBuffer.md)[]

Defined in: [lib/neuro/mesh-generator.ts:403](https://github.com/fderuiter/portfolio/blob/main/lib/neuro/mesh-generator.ts#L403)

Procedurally generates raw cortical surface geometry array buffers synchronously.

## Parameters

### mode?

[`SurfaceMode`](../../types/type-aliases/SurfaceMode.md) = `"pial"`

### wireframe?

`boolean` = `false`

### hemiFilter?

[`HemisphereFilter`](../../types/type-aliases/HemisphereFilter.md) = `"both"`

## Returns

[`RawGeometryBuffer`](../../types/interfaces/RawGeometryBuffer.md)[]

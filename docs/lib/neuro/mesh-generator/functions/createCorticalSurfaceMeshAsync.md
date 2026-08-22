[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/neuro/mesh-generator](../README.md) / createCorticalSurfaceMeshAsync

# Function: createCorticalSurfaceMeshAsync()

> **createCorticalSurfaceMeshAsync**(`mode?`, `wireframe?`, `hemiFilter?`): `Promise`\<`Group`\<`Object3DEventMap`\>\>

Defined in: [lib/neuro/mesh-generator.ts:420](https://github.com/fderuiter/portfolio/blob/main/lib/neuro/mesh-generator.ts#L420)

Offloads 25,000+ vertex spatial point checks and Desikan-Killiany atlas parcellations
to a background Web Worker thread, returning compiled THREE.Group with zero-copy Transferable ArrayBuffers.

## Parameters

### mode?

[`SurfaceMode`](../../types/type-aliases/SurfaceMode.md) = `"pial"`

### wireframe?

`boolean` = `false`

### hemiFilter?

[`HemisphereFilter`](../../types/type-aliases/HemisphereFilter.md) = `"both"`

## Returns

`Promise`\<`Group`\<`Object3DEventMap`\>\>

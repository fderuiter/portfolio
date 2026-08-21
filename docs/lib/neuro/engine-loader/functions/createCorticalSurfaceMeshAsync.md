[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/neuro/engine-loader](../README.md) / createCorticalSurfaceMeshAsync

# Function: createCorticalSurfaceMeshAsync()

> **createCorticalSurfaceMeshAsync**(`mode?`, `wireframe?`, `hemiFilter?`): `Promise`\<`Group`\<`Object3DEventMap`\>\>

Defined in: [lib/neuro/engine-loader.ts:148](https://github.com/fderuiter/portfolio/blob/main/lib/neuro/engine-loader.ts#L148)

Asynchronous mesh construction helper using raw geometry buffers.

## Parameters

### mode?

[`SurfaceMode`](../../types/type-aliases/SurfaceMode.md) = `"pial"`

### wireframe?

`boolean` = `false`

### hemiFilter?

[`HemisphereFilter`](../../types/type-aliases/HemisphereFilter.md) = `"both"`

## Returns

`Promise`\<`Group`\<`Object3DEventMap`\>\>

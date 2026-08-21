[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/neuro/mesh-generator](../README.md) / getAnatomicalParcelAtCoordinate

# Function: getAnatomicalParcelAtCoordinate()

> **getAnatomicalParcelAtCoordinate**(`pos`, `isLeft`): [`AnatomicalParcel`](../../types/interfaces/AnatomicalParcel.md)

Defined in: [lib/neuro/mesh-generator.ts:30](https://github.com/fderuiter/portfolio/blob/main/lib/neuro/mesh-generator.ts#L30)

Determine the Desikan-Killiany anatomical parcel for a 3D coordinate on a cerebral hemisphere.
Coordinates are in normalized Three.js model space.

## Parameters

### pos

#### x

`number`

#### y

`number`

#### z

`number`

### isLeft

`boolean`

## Returns

[`AnatomicalParcel`](../../types/interfaces/AnatomicalParcel.md)

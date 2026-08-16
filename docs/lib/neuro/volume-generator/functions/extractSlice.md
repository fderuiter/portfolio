[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/neuro/volume-generator](../README.md) / extractSlice

# Function: extractSlice()

> **extractSlice**(`volume`, `plane`, `sliceIndex`): `object`

Defined in: [lib/neuro/volume-generator.ts:225](https://github.com/fderuiter/portfolio/blob/main/lib/neuro/volume-generator.ts#L225)

Extract a 2D slice from the 3D volume along an anatomical plane.

## Parameters

### volume

[`SyntheticVolume`](../interfaces/SyntheticVolume.md)

### plane

`"axial"` \| `"coronal"` \| `"sagittal"`

### sliceIndex

`number`

## Returns

`object`

### height

> **height**: `number`

### mask

> **mask**: `Uint8Array`

### pixels

> **pixels**: `Uint8Array`

### width

> **width**: `number`

### wm

> **wm**: `Uint8Array`

[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/grid-reorder](../README.md) / calculateRowRelativeMoveIndex

# Function: calculateRowRelativeMoveIndex()

> **calculateRowRelativeMoveIndex**(`fields`, `fieldIndex`, `direction`, `maxColumns?`): `number`

Defined in: [lib/crf/grid-reorder.ts:115](https://github.com/fderuiter/portfolio/blob/main/lib/crf/grid-reorder.ts#L115)

Calculates target flat array index for moving a field up or down across cumulative row boundaries.

## Parameters

### fields

[`CRFField`](../../types/interfaces/CRFField.md)[]

### fieldIndex

`number`

### direction

`"up"` \| `"down"`

### maxColumns?

`number` = `12`

## Returns

`number`

[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/grid-reorder](../README.md) / spliceFieldIntoSection

# Function: spliceFieldIntoSection()

> **spliceFieldIntoSection**(`sourceFields`, `targetFields`, `sourceIndex`, `targetIndex`, `isSameSection`, `maxColumns?`): `object`

Defined in: [lib/crf/grid-reorder.ts:201](https://github.com/fderuiter/portfolio/blob/main/lib/crf/grid-reorder.ts#L201)

Splices a dragged field into a target section at a computed index, respecting row fill capacities.

## Parameters

### sourceFields

[`CRFField`](../../types/interfaces/CRFField.md)[]

### targetFields

[`CRFField`](../../types/interfaces/CRFField.md)[]

### sourceIndex

`number`

### targetIndex

`number`

### isSameSection

`boolean`

### maxColumns?

`number` = `12`

## Returns

`object`

### updatedSourceFields

> **updatedSourceFields**: [`CRFField`](../../types/interfaces/CRFField.md)[]

### updatedTargetFields

> **updatedTargetFields**: [`CRFField`](../../types/interfaces/CRFField.md)[]

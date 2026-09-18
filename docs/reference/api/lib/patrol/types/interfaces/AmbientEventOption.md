[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/patrol/types](../README.md) / AmbientEventOption

# Interface: AmbientEventOption

A selectable response option within an ambient operational mini-event.

## Properties

### category?

> `optional` **category?**: [`ActionCategory`](../type-aliases/ActionCategory.md)

***

### closedTrailsDelta?

> `optional` **closedTrailsDelta?**: `object`

#### add?

> `optional` **add?**: `string`[]

#### remove?

> `optional` **remove?**: `string`[]

***

### consequenceText

> **consequenceText**: `string`

***

### description?

> `optional` **description?**: `string`

***

### emittedEvent?

> `optional` **emittedEvent?**: `Partial`\<[`PatrolEvent`](PatrolEvent.md)\>

Emitted event context or payload appended to activeEvents

***

### equipmentLocation?

> `optional` **equipmentLocation?**: `string`

***

### id

> **id**: `string`

***

### label

> **label**: `string`

***

### timeIncrementMinutes?

> `optional` **timeIncrementMinutes?**: `number`

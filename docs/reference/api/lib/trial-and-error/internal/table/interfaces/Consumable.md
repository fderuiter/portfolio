[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/table](../README.md) / Consumable

# Interface: Consumable

A footnote seal in the consumable tray. `id` is unique within the tray.

## Properties

### id

> **id**: `string`

***

### seal

> **seal**: `object`

#### effect

> **effect**: \{ `kind`: `"PLUS_CHIPS"`; `value`: `number`; \} \| \{ `kind`: `"PLUS_MULT"`; `value`: `number`; \} \| \{ `kind`: `"WAIVE"`; \} = `SealEffectSchema`

#### eligible

> **eligible**: `object`

Outputs the seal may be affixed to. An absent list allows any.

##### eligible.cardTypes?

> `optional` **cardTypes?**: (`"TABLE"` \| `"LISTING"` \| `"FIGURE"` \| `"SUBJECT_TOKEN"`)[]

##### eligible.populations?

> `optional` **populations?**: (`"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"`)[]

##### eligible.topics?

> `optional` **topics?**: `string`[]

#### footnote

> **footnote**: `string`

The footnote as it prints under the output.

#### id

> **id**: `string` = `identifier`

#### name

> **name**: `string`

#### sellValue

> **sellValue**: `number` = `nonNegativeInt`

What selling it adds to the study budget.

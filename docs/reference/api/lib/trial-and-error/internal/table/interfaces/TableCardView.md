[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/table](../README.md) / TableCardView

# Interface: TableCardView

One card in hand as the table should render it.

## Properties

### card

> **card**: `object`

#### cardType

> **cardType**: `"TABLE"` \| `"LISTING"` \| `"FIGURE"` \| `"SUBJECT_TOKEN"` = `CardTypeSchema`

#### chips

> **chips**: `number` = `nonNegativeInt`

#### csrStage?

> `optional` **csrStage?**: `"DISPOSITION"` \| `"BASELINE"` \| `"EFFICACY"` \| `"SAFETY_AE"` \| `"PATIENT_LISTING"`

#### draftId?

> `optional` **draftId?**: `string`

#### id

> **id**: `string` = `identifier`

#### mult

> **mult**: `number` = `nonNegativeInt`

#### number

> **number**: `string`

#### population

> **population**: `"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"` = `PopulationTypeSchema`

#### soc?

> `optional` **soc?**: `string`

#### title

> **title**: `string`

#### topic

> **topic**: `string` = `identifier`

***

### inspectable

> **inspectable**: `boolean`

The card has reviewable cells in this slice.

***

### inspected

> **inspected**: `boolean`

CPU has been spent to inspect this card.

***

### openRedlines

> **openRedlines**: `number`

Revealed findings still uncorrected.

***

### selected

> **selected**: `boolean`

***

### unverified

> **unverified**: `boolean`

Inspectable but never inspected: its true findings are unknown.

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

#### face?

> `optional` **face?**: \{ `columns`: `string`[]; `kind`: `"TABLE"`; `rows`: `object`[]; \} \| \{ `columns`: `string`[]; `kind`: `"LISTING"`; `rows`: `string`[][]; \} \| \{ `kind`: `"FIGURE"`; `plot`: \{ `series`: `object`[]; `type`: `"KM"`; \} \| \{ `series`: `object`[]; `type`: `"SPARKLINE"`; \} \| \{ `intervals`: `object`[]; `reference`: `number`; `type`: `"FOREST"`; \}; \} \| \{ `cohort`: `string`; `count`: `number`; `kind`: `"TOKEN"`; \}

Face data. Draft cards derive their face from the draft table instead.

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

### debuffed

> **debuffed**: `boolean`

The Boss Blind's debuff cancels this card's Chips.

***

### face

> **face**: \{ `columns`: `string`[]; `kind`: `"TABLE"`; `rows`: `object`[]; \} \| \{ `columns`: `string`[]; `kind`: `"LISTING"`; `rows`: `string`[][]; \} \| \{ `kind`: `"FIGURE"`; `plot`: \{ `series`: `object`[]; `type`: `"KM"`; \} \| \{ `series`: `object`[]; `type`: `"SPARKLINE"`; \} \| \{ `intervals`: `object`[]; `reference`: `number`; `type`: `"FOREST"`; \}; \} \| \{ `cohort`: `string`; `count`: `number`; `kind`: `"TOKEN"`; \}

The live mini-output printed on the card, as currently reviewed.

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

### provenance

> **provenance**: `object`

The snapshot this card was compiled against.

#### capturedAt

> **capturedAt**: `string`

#### id

> **id**: `string` = `identifier`

#### version

> **version**: `number`

***

### selected

> **selected**: `boolean`

***

### stale

> **stale**: `boolean`

Compiled against a snapshot whose membership of this card's suit has since changed.

***

### stamps

> **stamps**: (`"REDLINE"` \| `"QC_PASS"` \| `"STALE"` \| `"SEALED"` \| `"BLINDED"`)[]

Marks stamped on the face, in display order.

***

### unverified

> **unverified**: `boolean`

Inspectable but never inspected: its true findings are unknown.

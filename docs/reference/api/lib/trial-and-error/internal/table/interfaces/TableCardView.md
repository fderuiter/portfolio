[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/table](../README.md) / TableCardView

# Interface: TableCardView

One card in hand as the table should render it.

## Properties

### blank

> **blank**: `boolean`

A blank shell with no analysis set allocated: it cannot be played yet.

***

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

#### shellId?

> `optional` **shellId?**: `string`

A blank shell: a planned output with no cohort data allocated yet. It
compiles only once the player allocates one of the shell's analysis sets.

#### soc?

> `optional` **soc?**: `string`

#### title

> **title**: `string`

#### topic

> **topic**: `string` = `identifier`

***

### compatiblePopulations

> **compatiblePopulations**: (`"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"`)[]

The analysis sets this card's shell accepts. Empty for face-only cards.

***

### debuffed

> **debuffed**: `boolean`

The Boss Blind's debuff cancels this card's Chips.

***

### face

> **face**: \{ `columns`: `string`[]; `kind`: `"TABLE"`; `rows`: `object`[]; \} \| \{ `columns`: `string`[]; `kind`: `"LISTING"`; `rows`: `string`[][]; \} \| \{ `kind`: `"FIGURE"`; `plot`: \{ `series`: `object`[]; `type`: `"KM"`; \} \| \{ `series`: `object`[]; `type`: `"SPARKLINE"`; \} \| \{ `intervals`: `object`[]; `reference`: `number`; `type`: `"FOREST"`; \}; \} \| \{ `cohort`: `string`; `count`: `number`; `kind`: `"TOKEN"`; \}

The live mini-output printed on the card, as currently reviewed.

***

### footnoteSlots

> **footnoteSlots**: `number`

How many footnote seals this output takes: its shell's slots.

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

### pairedWith

> **pairedWith**: `string`[]

Cards in hand this one forms a TLF Pair with: a Table's supporting
Listings, or a Listing's Tables. The linked-card indicator.

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

### seals

> **seals**: `object`[]

Footnote seals affixed to this output, in the order applied.

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

***

### selected

> **selected**: `boolean`

***

### stale

> **stale**: `boolean`

Compiled against a snapshot whose membership of this card's suit has since changed.

***

### stamps

> **stamps**: (`"REDLINE"` \| `"SEALED"` \| `"QC_PASS"` \| `"STALE"` \| `"BLINDED"`)[]

Marks stamped on the face, in display order.

***

### unverified

> **unverified**: `boolean`

Inspectable but never inspected: its true findings are unknown.

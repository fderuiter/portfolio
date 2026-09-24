[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/table](../README.md) / cardShortName

# Function: cardShortName()

> **cardShortName**(`card`): `string`

A card's number, plus its draft letter when the title carries one, so two
drafts of one table stay distinguishable: "Table 14.3.1 (Draft A)".

## Parameters

### card

#### cardType

`"TABLE"` \| `"LISTING"` \| `"FIGURE"` \| `"SUBJECT_TOKEN"` = `CardTypeSchema`

#### chips

`number` = `nonNegativeInt`

#### csrStage?

`"DISPOSITION"` \| `"BASELINE"` \| `"EFFICACY"` \| `"SAFETY_AE"` \| `"PATIENT_LISTING"` = `...`

#### draftId?

`string` = `...`

#### face?

\{ `columns`: `string`[]; `kind`: `"TABLE"`; `rows`: `object`[]; \} \| \{ `columns`: `string`[]; `kind`: `"LISTING"`; `rows`: `string`[][]; \} \| \{ `kind`: `"FIGURE"`; `plot`: \{ `series`: `object`[]; `type`: `"KM"`; \} \| \{ `series`: `object`[]; `type`: `"SPARKLINE"`; \} \| \{ `intervals`: `object`[]; `reference`: `number`; `type`: `"FOREST"`; \}; \} \| \{ `cohort`: `string`; `count`: `number`; `kind`: `"TOKEN"`; \} = `...`

Face data. Draft cards derive their face from the draft table instead.

#### id

`string` = `identifier`

#### mult

`number` = `nonNegativeInt`

#### number

`string` = `...`

#### population

`"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"` = `PopulationTypeSchema`

#### soc?

`string` = `...`

#### title

`string` = `...`

#### topic

`string` = `identifier`

## Returns

`string`

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

\{ `columns`: `string`[]; `kind`: `"TABLE"`; `rows`: `object`[]; \} \| \{ `columns`: `string`[]; `kind`: `"LISTING"`; `rows`: `string`[][]; \} \| \{ `atRisk?`: \{ `rows`: `object`[]; `times`: `number`[]; \}; `kind`: `"FIGURE"`; `plot`: \{ `series`: `object`[]; `type`: `"KM"`; \} \| \{ `series`: `object`[]; `type`: `"SPARKLINE"`; \} \| \{ `intervals`: `object`[]; `reference`: `number`; `type`: `"FOREST"`; \}; `source?`: `string`; \} \| \{ `cohort`: `string`; `count`: `number`; `kind`: `"TOKEN"`; \} = `...`

Face data. Draft cards derive their face from the draft table instead.

#### id

`string` = `identifier`

#### km?

\{ `displayed`: `object`[]; `endpoint`: `string`; `milestones`: `number`[]; `parent`: \{ `atRiskRow`: `string`; `cardId`: `string`; `eventsRow`: `string`; \}; `populationSnapshotId`: `string`; `records`: `object`[]; `timeOrigin`: `number`; `timeUnit`: `string`; \} = `...`

A Kaplan–Meier figure: its face is drawn from this data.

#### km.displayed

`object`[] = `...`

#### km.endpoint

`string` = `...`

#### km.milestones

`number`[] = `...`

Number-at-Risk milestone times, strictly increasing, from 0.

#### km.parent

\{ `atRiskRow`: `string`; `cardId`: `string`; `eventsRow`: `string`; \} = `...`

#### km.parent.atRiskRow

`string` = `faceText`

#### km.parent.cardId

`string` = `identifier`

#### km.parent.eventsRow

`string` = `faceText`

#### km.populationSnapshotId

`string` = `identifier`

#### km.records

`object`[] = `...`

#### km.timeOrigin

`number` = `...`

The time origin the draft's axis starts at. The SAP fixes it at 0.

#### km.timeUnit

`string` = `...`

#### mult

`number` = `nonNegativeInt`

#### number

`string` = `...`

#### population

`"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"` = `PopulationTypeSchema`

#### shellId?

`string` = `...`

A blank shell: a planned output with no cohort data allocated yet. It
compiles only once the player allocates one of the shell's analysis sets.

#### soc?

`string` = `...`

#### title

`string` = `...`

#### topic

`string` = `identifier`

## Returns

`string`

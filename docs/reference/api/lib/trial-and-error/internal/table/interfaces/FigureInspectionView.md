[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/table](../README.md) / FigureInspectionView

# Interface: FigureInspectionView

The open Inspect drawer's content for a Kaplan–Meier figure.

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

> `optional` **face?**: \{ `columns`: `string`[]; `kind`: `"TABLE"`; `rows`: `object`[]; \} \| \{ `columns`: `string`[]; `kind`: `"LISTING"`; `rows`: `string`[][]; \} \| \{ `atRisk?`: \{ `rows`: `object`[]; `times`: `number`[]; \}; `kind`: `"FIGURE"`; `plot`: \{ `series`: `object`[]; `type`: `"KM"`; \} \| \{ `series`: `object`[]; `type`: `"SPARKLINE"`; \} \| \{ `intervals`: `object`[]; `reference`: `number`; `type`: `"FOREST"`; \}; `source?`: `string`; \} \| \{ `cohort`: `string`; `count`: `number`; `kind`: `"TOKEN"`; \}

Face data. Draft cards derive their face from the draft table instead.

##### Union Members

###### Type Literal

\{ `columns`: `string`[]; `kind`: `"TABLE"`; `rows`: `object`[]; \}

***

###### Type Literal

\{ `columns`: `string`[]; `kind`: `"LISTING"`; `rows`: `string`[][]; \}

***

###### Type Literal

\{ `atRisk?`: \{ `rows`: `object`[]; `times`: `number`[]; \}; `kind`: `"FIGURE"`; `plot`: \{ `series`: `object`[]; `type`: `"KM"`; \} \| \{ `series`: `object`[]; `type`: `"SPARKLINE"`; \} \| \{ `intervals`: `object`[]; `reference`: `number`; `type`: `"FOREST"`; \}; `source?`: `string`; \}

###### atRisk?

> `optional` **atRisk?**: `object`

The Number-at-Risk strip under a KM plot, one row per arm.

###### atRisk.rows

> **rows**: `object`[]

###### atRisk.times

> **times**: `number`[]

###### kind

> **kind**: `"FIGURE"`

###### plot

> **plot**: \{ `series`: `object`[]; `type`: `"KM"`; \} \| \{ `series`: `object`[]; `type`: `"SPARKLINE"`; \} \| \{ `intervals`: `object`[]; `reference`: `number`; `type`: `"FOREST"`; \} = `FigurePlotSchema`

###### source?

> `optional` **source?**: `string`

The parent Table's number, printed on a dependent Figure.

***

###### Type Literal

\{ `cohort`: `string`; `count`: `number`; `kind`: `"TOKEN"`; \}

#### id

> **id**: `string` = `identifier`

#### km?

> `optional` **km?**: `object`

A Kaplan–Meier figure: its face is drawn from this data.

##### km.displayed

> **displayed**: `object`[]

##### km.endpoint

> **endpoint**: `string`

##### km.milestones

> **milestones**: `number`[]

Number-at-Risk milestone times, strictly increasing, from 0.

##### km.parent

> **parent**: `object`

##### km.parent.atRiskRow

> **atRiskRow**: `string` = `faceText`

##### km.parent.cardId

> **cardId**: `string` = `identifier`

##### km.parent.eventsRow

> **eventsRow**: `string` = `faceText`

##### km.populationSnapshotId

> **populationSnapshotId**: `string` = `identifier`

##### km.records

> **records**: `object`[]

##### km.timeOrigin

> **timeOrigin**: `number`

The time origin the draft's axis starts at. The SAP fixes it at 0.

##### km.timeUnit

> **timeUnit**: `string`

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

### expected

> **expected**: `object`

The Figure's own value as a High Table.

#### base

> **base**: `object` = `HandBaseScoreSchema`

The hand's base at that level: its level-1 base plus the level bonus.

##### base.baseChips

> **baseChips**: `number` = `nonNegativeInt`

##### base.baseMult

> **baseMult**: `number` = `nonNegativeInt`

##### base.description

> **description**: `string`

##### base.handType

> **handType**: `"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"` = `HandTypeSchema`

#### cardIds

> **cardIds**: `string`[]

#### chips

> **chips**: `object`

##### chips.base

> **base**: `number`

##### chips.outputs

> **outputs**: `number`

##### chips.relics

> **relics**: `number`

##### chips.total

> **total**: `number`

#### finalMult

> **finalMult**: `number`

#### handType

> **handType**: `"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"` = `HandTypeSchema`

#### ledger

> **ledger**: `object`[]

#### level

> **level**: `number`

The hand type's level this hand was scored at.

#### mult

> **mult**: `object`

##### mult.base

> **base**: `number`

##### mult.cardsAndRules

> **cardsAndRules**: `number`

##### mult.relics

> **relics**: `number`

##### mult.total

> **total**: `number`

#### ruleResults

> **ruleResults**: `object`[]

#### score

> **score**: `number`

#### xMult

> **xMult**: `object`

##### xMult.factors

> **factors**: `object`[]

##### xMult.product

> **product**: `number`

#### zeroRule

> **zeroRule**: `object`

##### zeroRule.ruleIds

> **ruleIds**: `string`[]

##### zeroRule.triggered

> **triggered**: `boolean`

***

### km

> **km**: `object`

#### displayed

> **displayed**: `object`[]

#### endpoint

> **endpoint**: `string`

#### milestones

> **milestones**: `number`[]

Number-at-Risk milestone times, strictly increasing, from 0.

#### parent

> **parent**: `object`

##### parent.atRiskRow

> **atRiskRow**: `string` = `faceText`

##### parent.cardId

> **cardId**: `string` = `identifier`

##### parent.eventsRow

> **eventsRow**: `string` = `faceText`

#### populationSnapshotId

> **populationSnapshotId**: `string` = `identifier`

#### records

> **records**: `object`[]

#### timeOrigin

> **timeOrigin**: `number`

The time origin the draft's axis starts at. The SAP fixes it at 0.

#### timeUnit

> **timeUnit**: `string`

***

### openFindings

> **openFindings**: [`KmFinding`](../../km/interfaces/KmFinding.md)[]

Findings still uncorrected. Inspection reveals every KM finding.

***

### parent

> **parent**: \{ `cardType`: `"TABLE"` \| `"LISTING"` \| `"FIGURE"` \| `"SUBJECT_TOKEN"`; `chips`: `number`; `csrStage?`: `"DISPOSITION"` \| `"BASELINE"` \| `"EFFICACY"` \| `"SAFETY_AE"` \| `"PATIENT_LISTING"`; `draftId?`: `string`; `face?`: \{ `columns`: `string`[]; `kind`: `"TABLE"`; `rows`: `object`[]; \} \| \{ `columns`: `string`[]; `kind`: `"LISTING"`; `rows`: `string`[][]; \} \| \{ `atRisk?`: \{ `rows`: `object`[]; `times`: `number`[]; \}; `kind`: `"FIGURE"`; `plot`: \{ `series`: `object`[]; `type`: `"KM"`; \} \| \{ `series`: `object`[]; `type`: `"SPARKLINE"`; \} \| \{ `intervals`: `object`[]; `reference`: `number`; `type`: `"FOREST"`; \}; `source?`: `string`; \} \| \{ `cohort`: `string`; `count`: `number`; `kind`: `"TOKEN"`; \}; `id`: `string`; `km?`: \{ `displayed`: `object`[]; `endpoint`: `string`; `milestones`: `number`[]; `parent`: \{ `atRiskRow`: `string`; `cardId`: `string`; `eventsRow`: `string`; \}; `populationSnapshotId`: `string`; `records`: `object`[]; `timeOrigin`: `number`; `timeUnit`: `string`; \}; `mult`: `number`; `number`: `string`; `population`: `"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"`; `shellId?`: `string`; `soc?`: `string`; `title`: `string`; `topic`: `string`; \} \| `null`

#### Union Members

##### Type Literal

\{ `cardType`: `"TABLE"` \| `"LISTING"` \| `"FIGURE"` \| `"SUBJECT_TOKEN"`; `chips`: `number`; `csrStage?`: `"DISPOSITION"` \| `"BASELINE"` \| `"EFFICACY"` \| `"SAFETY_AE"` \| `"PATIENT_LISTING"`; `draftId?`: `string`; `face?`: \{ `columns`: `string`[]; `kind`: `"TABLE"`; `rows`: `object`[]; \} \| \{ `columns`: `string`[]; `kind`: `"LISTING"`; `rows`: `string`[][]; \} \| \{ `atRisk?`: \{ `rows`: `object`[]; `times`: `number`[]; \}; `kind`: `"FIGURE"`; `plot`: \{ `series`: `object`[]; `type`: `"KM"`; \} \| \{ `series`: `object`[]; `type`: `"SPARKLINE"`; \} \| \{ `intervals`: `object`[]; `reference`: `number`; `type`: `"FOREST"`; \}; `source?`: `string`; \} \| \{ `cohort`: `string`; `count`: `number`; `kind`: `"TOKEN"`; \}; `id`: `string`; `km?`: \{ `displayed`: `object`[]; `endpoint`: `string`; `milestones`: `number`[]; `parent`: \{ `atRiskRow`: `string`; `cardId`: `string`; `eventsRow`: `string`; \}; `populationSnapshotId`: `string`; `records`: `object`[]; `timeOrigin`: `number`; `timeUnit`: `string`; \}; `mult`: `number`; `number`: `string`; `population`: `"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"`; `shellId?`: `string`; `soc?`: `string`; `title`: `string`; `topic`: `string`; \}

##### cardType

> **cardType**: `"TABLE"` \| `"LISTING"` \| `"FIGURE"` \| `"SUBJECT_TOKEN"` = `CardTypeSchema`

##### chips

> **chips**: `number` = `nonNegativeInt`

##### csrStage?

> `optional` **csrStage?**: `"DISPOSITION"` \| `"BASELINE"` \| `"EFFICACY"` \| `"SAFETY_AE"` \| `"PATIENT_LISTING"`

##### draftId?

> `optional` **draftId?**: `string`

##### face?

> `optional` **face?**: \{ `columns`: `string`[]; `kind`: `"TABLE"`; `rows`: `object`[]; \} \| \{ `columns`: `string`[]; `kind`: `"LISTING"`; `rows`: `string`[][]; \} \| \{ `atRisk?`: \{ `rows`: `object`[]; `times`: `number`[]; \}; `kind`: `"FIGURE"`; `plot`: \{ `series`: `object`[]; `type`: `"KM"`; \} \| \{ `series`: `object`[]; `type`: `"SPARKLINE"`; \} \| \{ `intervals`: `object`[]; `reference`: `number`; `type`: `"FOREST"`; \}; `source?`: `string`; \} \| \{ `cohort`: `string`; `count`: `number`; `kind`: `"TOKEN"`; \}

Face data. Draft cards derive their face from the draft table instead.

###### Union Members

###### Type Literal

\{ `columns`: `string`[]; `kind`: `"TABLE"`; `rows`: `object`[]; \}

***

###### Type Literal

\{ `columns`: `string`[]; `kind`: `"LISTING"`; `rows`: `string`[][]; \}

***

###### Type Literal

\{ `atRisk?`: \{ `rows`: `object`[]; `times`: `number`[]; \}; `kind`: `"FIGURE"`; `plot`: \{ `series`: `object`[]; `type`: `"KM"`; \} \| \{ `series`: `object`[]; `type`: `"SPARKLINE"`; \} \| \{ `intervals`: `object`[]; `reference`: `number`; `type`: `"FOREST"`; \}; `source?`: `string`; \}

###### atRisk?

> `optional` **atRisk?**: `object`

The Number-at-Risk strip under a KM plot, one row per arm.

###### atRisk.rows

> **rows**: `object`[]

###### atRisk.times

> **times**: `number`[]

###### kind

> **kind**: `"FIGURE"`

###### plot

> **plot**: \{ `series`: `object`[]; `type`: `"KM"`; \} \| \{ `series`: `object`[]; `type`: `"SPARKLINE"`; \} \| \{ `intervals`: `object`[]; `reference`: `number`; `type`: `"FOREST"`; \} = `FigurePlotSchema`

###### source?

> `optional` **source?**: `string`

The parent Table's number, printed on a dependent Figure.

***

###### Type Literal

\{ `cohort`: `string`; `count`: `number`; `kind`: `"TOKEN"`; \}

##### id

> **id**: `string` = `identifier`

##### km?

> `optional` **km?**: `object`

A Kaplan–Meier figure: its face is drawn from this data.

###### km.displayed

> **displayed**: `object`[]

###### km.endpoint

> **endpoint**: `string`

###### km.milestones

> **milestones**: `number`[]

Number-at-Risk milestone times, strictly increasing, from 0.

###### km.parent

> **parent**: `object`

###### km.parent.atRiskRow

> **atRiskRow**: `string` = `faceText`

###### km.parent.cardId

> **cardId**: `string` = `identifier`

###### km.parent.eventsRow

> **eventsRow**: `string` = `faceText`

###### km.populationSnapshotId

> **populationSnapshotId**: `string` = `identifier`

###### km.records

> **records**: `object`[]

###### km.timeOrigin

> **timeOrigin**: `number`

The time origin the draft's axis starts at. The SAP fixes it at 0.

###### km.timeUnit

> **timeUnit**: `string`

##### mult

> **mult**: `number` = `nonNegativeInt`

##### number

> **number**: `string`

##### population

> **population**: `"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"` = `PopulationTypeSchema`

##### shellId?

> `optional` **shellId?**: `string`

A blank shell: a planned output with no cohort data allocated yet. It
compiles only once the player allocates one of the shell's analysis sets.

##### soc?

> `optional` **soc?**: `string`

##### title

> **title**: `string`

##### topic

> **topic**: `string` = `identifier`

***

`null`

***

### provenance

> **provenance**: `object`

#### capturedAt

> **capturedAt**: `string`

#### id

> **id**: `string` = `identifier`

#### version

> **version**: `number`

***

### report

> **report**: [`KmReport`](../../km/interfaces/KmReport.md)

***

### resolvedFindingIds

> **resolvedFindingIds**: `string`[]

***

### stale

> **stale**: `boolean`

***

### status

> **status**: [`FigureStatus`](FigureStatus.md)

***

### unpenalizedMult

> **unpenalizedMult**: `number`

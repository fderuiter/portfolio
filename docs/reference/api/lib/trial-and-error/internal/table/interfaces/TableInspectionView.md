[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/table](../README.md) / TableInspectionView

# Interface: TableInspectionView

The open Inspect drawer's content.

## Extends

- [`InspectionView`](../../inspection/interfaces/InspectionView.md)

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

### cells

> **cells**: [`DeskCellView`](../../inspection/interfaces/DeskCellView.md)[][]

#### Inherited from

[`InspectionView`](../../inspection/interfaces/InspectionView.md).[`cells`](../../inspection/interfaces/InspectionView.md#cells)

***

### expected

> **expected**: `object`

The card's own value as a High Table, from revealed findings.

#### base

> **base**: `object` = `HandBaseScoreSchema`

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

### openFindings

> **openFindings**: `object`[]

Revealed findings not yet corrected.

#### category

> **category**: `"DENOMINATOR"` \| `"PRECISION"` \| `"ROUNDING"` \| `"VALUE"` = `QcCategorySchema`

#### cell

> **cell**: `object` = `CellCoordinatesSchema`

##### cell.col

> **col**: `number` = `nonNegativeInt`

##### cell.row

> **row**: `number` = `nonNegativeInt`

#### consequence

> **consequence**: `string`

#### evidence

> **evidence**: `string`

#### expected

> **expected**: `string`

#### id

> **id**: `string`

Stable identifier: `<ruleId>@r<row>c<col>`.

#### observed

> **observed**: `string`

#### rule

> **rule**: `string`

#### ruleId

> **ruleId**: `string` = `identifier`

#### severity

> **severity**: `"FATAL"` \| `"MAJOR"` \| `"MINOR"` = `QcSeveritySchema`

#### Inherited from

[`InspectionView`](../../inspection/interfaces/InspectionView.md).[`openFindings`](../../inspection/interfaces/InspectionView.md#openfindings)

***

### provenance

> **provenance**: `object`

The snapshot the inspected output was compiled against.

#### capturedAt

> **capturedAt**: `string`

#### id

> **id**: `string` = `identifier`

#### version

> **version**: `number`

***

### reviewedCells

> **reviewedCells**: `number`

#### Inherited from

[`InspectionView`](../../inspection/interfaces/InspectionView.md).[`reviewedCells`](../../inspection/interfaces/InspectionView.md#reviewedcells)

***

### stale

> **stale**: `boolean`

***

### table

> **table**: `object`

#### cells

> **cells**: `string`[][]

#### columns

> **columns**: `object`[]

#### draftLabel

> **draftLabel**: `string`

#### id

> **id**: `string` = `identifier`

#### populationSnapshotId

> **populationSnapshotId**: `string` = `identifier`

#### rows

> **rows**: `object`[]

#### shellId

> **shellId**: `string` = `identifier`

***

### totalCells

> **totalCells**: `number`

#### Inherited from

[`InspectionView`](../../inspection/interfaces/InspectionView.md).[`totalCells`](../../inspection/interfaces/InspectionView.md#totalcells)

***

### unpenalizedMult

> **unpenalizedMult**: `number`

***

### visibleFindings

> **visibleFindings**: `object`[]

Findings revealed by inspection, in validator order.

#### category

> **category**: `"DENOMINATOR"` \| `"PRECISION"` \| `"ROUNDING"` \| `"VALUE"` = `QcCategorySchema`

#### cell

> **cell**: `object` = `CellCoordinatesSchema`

##### cell.col

> **col**: `number` = `nonNegativeInt`

##### cell.row

> **row**: `number` = `nonNegativeInt`

#### consequence

> **consequence**: `string`

#### evidence

> **evidence**: `string`

#### expected

> **expected**: `string`

#### id

> **id**: `string`

Stable identifier: `<ruleId>@r<row>c<col>`.

#### observed

> **observed**: `string`

#### rule

> **rule**: `string`

#### ruleId

> **ruleId**: `string` = `identifier`

#### severity

> **severity**: `"FATAL"` \| `"MAJOR"` \| `"MINOR"` = `QcSeveritySchema`

#### Inherited from

[`InspectionView`](../../inspection/interfaces/InspectionView.md).[`visibleFindings`](../../inspection/interfaces/InspectionView.md#visiblefindings)

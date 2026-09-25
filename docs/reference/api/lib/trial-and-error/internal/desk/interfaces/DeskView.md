[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/desk](../README.md) / DeskView

# Interface: DeskView

Everything the HUD renders, derived purely from scenario and state.

## Properties

### canDiscard

> **canDiscard**: `boolean`

***

### canPlay

> **canPlay**: `boolean`

***

### cells

> **cells**: [`DeskCellView`](../../inspection/interfaces/DeskCellView.md)[][]

***

### expected

> **expected**: \{ `base`: \{ `baseChips`: `number`; `baseMult`: `number`; `description`: `string`; `handType`: `"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"`; \}; `cardIds`: `string`[]; `chips`: \{ `base`: `number`; `outputs`: `number`; `relics`: `number`; `total`: `number`; \}; `finalMult`: `number`; `handType`: `"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"`; `ledger`: `object`[]; `level`: `number`; `mult`: \{ `base`: `number`; `cardsAndRules`: `number`; `relics`: `number`; `total`: `number`; \}; `ruleResults`: `object`[]; `score`: `number`; `xMult`: \{ `factors`: `object`[]; `product`: `number`; \}; `zeroRule`: \{ `ruleIds`: `string`[]; `triggered`: `boolean`; \}; \} \| `null`

Expected hand value from what the reviewer has seen so far.

#### Union Members

##### Type Literal

\{ `base`: \{ `baseChips`: `number`; `baseMult`: `number`; `description`: `string`; `handType`: `"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"`; \}; `cardIds`: `string`[]; `chips`: \{ `base`: `number`; `outputs`: `number`; `relics`: `number`; `total`: `number`; \}; `finalMult`: `number`; `handType`: `"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"`; `ledger`: `object`[]; `level`: `number`; `mult`: \{ `base`: `number`; `cardsAndRules`: `number`; `relics`: `number`; `total`: `number`; \}; `ruleResults`: `object`[]; `score`: `number`; `xMult`: \{ `factors`: `object`[]; `product`: `number`; \}; `zeroRule`: \{ `ruleIds`: `string`[]; `triggered`: `boolean`; \}; \}

##### base

> **base**: `object` = `HandBaseScoreSchema`

The hand's base at that level: its level-1 base plus the level bonus.

###### base.baseChips

> **baseChips**: `number` = `nonNegativeInt`

###### base.baseMult

> **baseMult**: `number` = `nonNegativeInt`

###### base.description

> **description**: `string`

###### base.handType

> **handType**: `"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"` = `HandTypeSchema`

##### cardIds

> **cardIds**: `string`[]

##### chips

> **chips**: `object`

###### chips.base

> **base**: `number`

###### chips.outputs

> **outputs**: `number`

###### chips.relics

> **relics**: `number`

###### chips.total

> **total**: `number`

##### finalMult

> **finalMult**: `number`

##### handType

> **handType**: `"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"` = `HandTypeSchema`

##### ledger

> **ledger**: `object`[]

##### level

> **level**: `number`

The hand type's level this hand was scored at.

##### mult

> **mult**: `object`

###### mult.base

> **base**: `number`

###### mult.cardsAndRules

> **cardsAndRules**: `number`

###### mult.relics

> **relics**: `number`

###### mult.total

> **total**: `number`

##### ruleResults

> **ruleResults**: `object`[]

##### score

> **score**: `number`

##### xMult

> **xMult**: `object`

###### xMult.factors

> **factors**: `object`[]

###### xMult.product

> **product**: `number`

##### zeroRule

> **zeroRule**: `object`

###### zeroRule.ruleIds

> **ruleIds**: `string`[]

###### zeroRule.triggered

> **triggered**: `boolean`

***

`null`

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

***

### quota

> **quota**: `number`

***

### remainingDraws

> **remainingDraws**: `number`

***

### reviewedCells

> **reviewedCells**: `number`

***

### table

> **table**: \{ `cells`: `string`[][]; `columns`: `object`[]; `draftLabel`: `string`; `id`: `string`; `populationSnapshotId`: `string`; `rows`: `object`[]; `shellId`: `string`; \} \| `null`

***

### totalCells

> **totalCells**: `number`

***

### unpenalizedMult

> **unpenalizedMult**: `number`

The expected +Mult before redline penalties, for the slash display.

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

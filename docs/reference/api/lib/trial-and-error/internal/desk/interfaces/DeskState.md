[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/desk](../README.md) / DeskState

# Interface: DeskState

Serializable QC Desk state. Contains no derived or browser data.

## Properties

### cpu

> **cpu**: [`CpuLedger`](../../cpu/interfaces/CpuLedger.md)

***

### discards

> **discards**: `number`

***

### drawIndex

> **drawIndex**: `number`

Position in the scenario's fixed draw pile of the staged draft.

***

### handsPlayed

> **handsPlayed**: `number`

***

### inspectedCells

> **inspectedCells**: `string`[]

Inspected cells of the staged draft as `row:col`, in inspection order.

***

### lastEvaluation

> **lastEvaluation**: \{ `base`: \{ `baseChips`: `number`; `baseMult`: `number`; `description`: `string`; `handType`: `"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"`; \}; `cardIds`: `string`[]; `chips`: \{ `base`: `number`; `outputs`: `number`; `relics`: `number`; `total`: `number`; \}; `finalMult`: `number`; `handType`: `"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"`; `ledger`: `object`[]; `level`: `number`; `mult`: \{ `base`: `number`; `cardsAndRules`: `number`; `relics`: `number`; `total`: `number`; \}; `ruleResults`: `object`[]; `score`: `number`; `xMult`: \{ `factors`: `object`[]; `product`: `number`; \}; `zeroRule`: \{ `ruleIds`: `string`[]; `triggered`: `boolean`; \}; \} \| `null`

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

### lastEvent

> **lastEvent**: [`DeskEvent`](DeskEvent.md) \| `null`

***

### resolvedFindingIds

> **resolvedFindingIds**: `string`[]

***

### roundScore

> **roundScore**: `number`

***

### scenarioId

> **scenarioId**: `string`

***

### status

> **status**: [`DeskStatus`](../type-aliases/DeskStatus.md)

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

> **lastEvaluation**: \{ `base`: \{ `baseChips`: `number`; `baseMult`: `number`; `description`: `string`; `handType`: `"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"`; \}; `cardIds`: `string`[]; `chips`: \{ `base`: `number`; `outputs`: `number`; `relics`: `number`; `total`: `number`; \}; `finalMult`: `number`; `handType`: `"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"`; `ledger`: `object`[]; `mult`: \{ `base`: `number`; `cardsAndRules`: `number`; `relics`: `number`; `total`: `number`; \}; `ruleResults`: `object`[]; `score`: `number`; `xMult`: \{ `factors`: `object`[]; `product`: `number`; \}; `zeroRule`: \{ `ruleIds`: `string`[]; `triggered`: `boolean`; \}; \} \| `null`

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

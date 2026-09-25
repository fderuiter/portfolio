[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/table](../README.md) / Inventory

# Interface: Inventory

What the player carries between Blinds besides the study: the consumable
tray, the study budget and the run's hand levels. The Procurement Shop
spends and fills it. Absent hand levels mean a fresh run's.

## Properties

### budget

> **budget**: `number`

***

### consumables

> **consumables**: [`Consumable`](../type-aliases/Consumable.md)[]

***

### handLevels?

> `optional` **handLevels?**: `Record`\<`"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"`, \{ `level`: `number`; `playedCount`: `number`; \}\>

***

### relics?

> `optional` **relics?**: `object`[]

SOP relics the run has earned.

#### description

> **description**: `string`

#### id

> **id**: `string` = `identifier`

#### modifier

> **modifier**: `object` = `ScoreModifierSchema`

##### modifier.chips

> **chips**: `number`

##### modifier.label

> **label**: `string`

##### modifier.plusMult

> **plusMult**: `number`

##### modifier.sourceId

> **sourceId**: `string` = `identifier`

##### modifier.xMult

> **xMult**: `number`

#### name

> **name**: `string`

[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/table](../README.md) / deriveTableView

# Function: deriveTableView()

> **deriveTableView**(`scenario`, `state`): [`TableView`](../interfaces/TableView.md)

Derives everything the Card Table renders. Pure; safe on every render.

## Parameters

### scenario

#### blind

\{ `name`: `string`; `quota`: `number`; `tier`: `"SMALL_BLIND"` \| `"BIG_BLIND"` \| `"BOSS_BLIND"`; \} = `BlindSchema`

#### blind.name

`string` = `...`

#### blind.quota

`number` = `...`

#### blind.tier

`"SMALL_BLIND"` \| `"BIG_BLIND"` \| `"BOSS_BLIND"` = `BlindTierSchema`

#### deck

`object`[] = `...`

#### drawPile

`object`[] = `...`

#### handType

`"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"` = `HandTypeSchema`

#### id

`string` = `identifier`

#### populationSnapshot

\{ `capturedAt`: `string`; `id`: `string`; `subjects`: `object`[]; `version`: `number`; \} = `PopulationSnapshotSchema`

#### populationSnapshot.capturedAt

`string` = `...`

#### populationSnapshot.id

`string` = `identifier`

#### populationSnapshot.subjects

`object`[] = `...`

#### populationSnapshot.version

`number` = `...`

#### rulebook

\{ `id`: `string`; `meanPrecision`: `number`; `percentPrecision`: `number`; `populationAliases`: `object`[]; `populationSuit`: `"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"`; `roundingMode`: `"HALF_EVEN"` \| `"HALF_AWAY_FROM_ZERO"` \| `"TRUNCATE"`; `rules`: `object`[]; `title`: `string`; \} = `SapRulebookSchema`

#### rulebook.id

`string` = `identifier`

#### rulebook.meanPrecision

`number` = `...`

#### rulebook.percentPrecision

`number` = `...`

#### rulebook.populationAliases

`object`[] = `...`

#### rulebook.populationSuit

`"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"` = `PopulationTypeSchema`

#### rulebook.roundingMode

`"HALF_EVEN"` \| `"HALF_AWAY_FROM_ZERO"` \| `"TRUNCATE"` = `RoundingModeSchema`

#### rulebook.rules

`object`[] = `...`

#### rulebook.title

`string` = `...`

#### shell

\{ `allowedFootnoteSlots`: `number`; `cardType`: `"TABLE"` \| `"LISTING"` \| `"FIGURE"` \| `"SUBJECT_TOKEN"`; `chips`: `number`; `id`: `string`; `isBlinded?`: `boolean`; `mult`: `number`; `requiredRulebookId`: `string`; `tableNumber`: `string`; `targetPopulation`: `"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"`; `title`: `string`; \} = `TableShellSpecSchema`

#### shell.allowedFootnoteSlots

`number` = `nonNegativeInt`

#### shell.cardType

`"TABLE"` \| `"LISTING"` \| `"FIGURE"` \| `"SUBJECT_TOKEN"` = `CardTypeSchema`

#### shell.chips

`number` = `nonNegativeInt`

#### shell.id

`string` = `identifier`

#### shell.isBlinded?

`boolean` = `...`

#### shell.mult

`number` = `nonNegativeInt`

#### shell.requiredRulebookId

`string` = `identifier`

#### shell.tableNumber

`string` = `...`

#### shell.targetPopulation

`"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"` = `PopulationTypeSchema`

#### shell.title

`string` = `...`

#### startingCpu

`number` = `nonNegativeInt`

#### summary

`string` = `...`

#### table

\{ `handSize`: `number`; `maxSelection`: `number`; `startingCpu`: `number`; \} = `TableRulesSchema`

#### table.handSize

`number` = `...`

#### table.maxSelection

`number` = `...`

#### table.startingCpu

`number` = `nonNegativeInt`

#### title

`string` = `...`

### state

[`TableState`](../interfaces/TableState.md)

## Returns

[`TableView`](../interfaces/TableView.md)

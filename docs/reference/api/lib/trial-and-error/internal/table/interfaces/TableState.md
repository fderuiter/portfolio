[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/table](../README.md) / TableState

# Interface: TableState

Serializable Card Table state. Contains no derived or browser data.

## Properties

### cpu

> **cpu**: [`CpuLedger`](../../cpu/interfaces/CpuLedger.md)

***

### deckIndex

> **deckIndex**: `number`

Index of the next undealt card in the scenario deck.

***

### discards

> **discards**: `number`

***

### drafts

> **drafts**: `Record`\<`string`, [`StagedTable`](../../../types/type-aliases/StagedTable.md)\>

Cards in hand whose draft was compiled against a later snapshot.

***

### hand

> **hand**: `string`[]

Card ids in hand, in deal order.

***

### handsPlayed

> **handsPlayed**: `number`

***

### inspecting

> **inspecting**: `string` \| `null`

The card whose Inspect drawer is open.

***

### inspections

> **inspections**: `Record`\<`string`, [`InspectionState`](../../inspection/interfaces/InspectionState.md)\>

Review progress per card, present once the card has been paid to inspect.

***

### invalidations

> **invalidations**: [`SnapshotInvalidation`](../../snapshots/interfaces/SnapshotInvalidation.md)[]

One record per population transition so far this study.

***

### lastEvent

> **lastEvent**: [`TableEvent`](TableEvent.md) \| `null`

***

### lastPlay

> **lastPlay**: [`PlayedHand`](PlayedHand.md) \| `null`

***

### opening

> **opening**: `object`

How much of `snapshots` and `invalidations` predates this Blind.

#### invalidations

> **invalidations**: `number`

#### snapshots

> **snapshots**: `number`

***

### provenance

> **provenance**: `Record`\<`string`, [`SnapshotRef`](../../../types/type-aliases/SnapshotRef.md)\>

The snapshot each card in hand was compiled against.

***

### roundScore

> **roundScore**: `number`

***

### scenarioId

> **scenarioId**: `string`

***

### selected

> **selected**: `string`[]

Selected card ids, in selection order (at most `maxSelection`).

***

### snapshots

> **snapshots**: `object`[]

Every population snapshot version so far, oldest first. The last is current.

#### capturedAt

> **capturedAt**: `string`

#### id

> **id**: `string` = `identifier`

#### subjects

> **subjects**: `object`[]

#### version

> **version**: `number`

***

### status

> **status**: [`DeskStatus`](../../desk/type-aliases/DeskStatus.md)

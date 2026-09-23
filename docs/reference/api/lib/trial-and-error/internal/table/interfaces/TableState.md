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

### lastEvent

> **lastEvent**: [`TableEvent`](TableEvent.md) \| `null`

***

### lastPlay

> **lastPlay**: [`PlayedHand`](PlayedHand.md) \| `null`

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

### status

> **status**: [`DeskStatus`](../../desk/type-aliases/DeskStatus.md)

[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/table](../README.md) / TableView

# Interface: TableView

Everything the Card Table renders, derived purely from scenario and state.

## Properties

### accessLog

> **accessLog**: [`AccessRecord`](../../blinding/interfaces/AccessRecord.md)[]

The Blind's DMC access history, oldest first.

***

### auditLog

> **auditLog**: [`TraceRecord`](TraceRecord.md)[]

The Blind's inspection audit log, for end-of-Blind grading.

***

### budget

> **budget**: `number`

***

### canDiscard

> **canDiscard**: `boolean`

***

### canInspect

> **canInspect**: `boolean`

***

### canPlay

> **canPlay**: `boolean`

***

### canRecompile

> **canRecompile**: `boolean`

***

### classification

> **classification**: \{ `handType`: `"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"`; `scoringCardIds`: `string`[]; \} \| `null`

***

### consumables

> **consumables**: [`Consumable`](../type-aliases/Consumable.md)[]

The consumable tray.

***

### consumableSlots

> **consumableSlots**: `number`

***

### crisis

> **crisis**: [`CrisisView`](CrisisView.md) \| `null`

The crisis to answer before the Blind can be played, if any.

***

### deckRemaining

> **deckRemaining**: `number`

***

### discardCost

> **discardCost**: `number`

What one discard costs, with any penalty.

***

### discardsAffordable

> **discardsAffordable**: `number`

***

### dmcCharter

> **dmcCharter**: `string` \| `null`

The charter the closed session is convened under, or null without a DMC.

***

### drawPile

> **drawPile**: `object`[]

The undealt deck, face down: opaque slots that carry no card data.

#### faceDown

> **faceDown**: `true`

#### slot

> **slot**: `string` = `identifier`

***

### emptySelected

> **emptySelected**: `string`[]

Selected blank shells with no analysis set allocated, in selection order.

***

### encounter

> **encounter**: [`EncounterView`](EncounterView.md) \| `null`

A staged encounter's progress, or null outside one.

***

### figureInspection

> **figureInspection**: [`FigureInspectionView`](FigureInspectionView.md) \| `null`

The open Inspect drawer's content when it holds a KM figure.

***

### firewall

> **firewall**: `boolean`

Treatment-arm values are face down (a DMC firewall).

***

### flushBrokenBy

> **flushBrokenBy**: `string`[]

Stale cards that alone stop the selection from being a Population Flush:
without them it would be one. Empty otherwise.

***

### hand

> **hand**: [`TableCardView`](TableCardView.md)[]

***

### handLevels

> **handLevels**: [`HandLevels`](../../../types/type-aliases/HandLevels.md)

The run's hand levels.

***

### handsAffordable

> **handsAffordable**: `number`

***

### handsLeft

> **handsLeft**: `number` \| `null`

Hands left under a hand limit, or null when there is none.

***

### handTable

> **handTable**: [`HandLevelRow`](../../hands/interfaces/HandLevelRow.md)[]

The run's hand table at current levels, weakest hand first, for Run Info.

***

### inspection

> **inspection**: [`TableInspectionView`](TableInspectionView.md) \| `null`

***

### invalidations

> **invalidations**: [`SnapshotInvalidation`](../../snapshots/interfaces/SnapshotInvalidation.md)[]

Every population transition so far this study, oldest first.

***

### lastTimeline

> **lastTimeline**: [`TimelineStep`](../../timeline/type-aliases/TimelineStep.md)[] \| `null`

The last played hand as an ordered scoring timeline, for playback.

***

### modifiers

> **modifiers**: `object`[]

Every modifier in force: the boss's, then any a crisis imposed.

#### debuffType

> **debuffType**: `"DISABLE_POPULATION"` \| `"HAND_LIMIT"` \| `"DISCARD_PENALTY"` \| `"BLIND_FIREWALL"` = `BossDebuffTypeSchema`

#### description

> **description**: `string`

#### disabledPopulations?

> `optional` **disabledPopulations?**: (`"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"`)[]

#### discardCpuPenalty?

> `optional` **discardCpuPenalty?**: `number`

#### id

> **id**: `string` = `identifier`

#### maxHandsAllowed?

> `optional` **maxHandsAllowed?**: `number`

#### name

> **name**: `string`

***

### pendingViolations

> **pendingViolations**: `string`[]

Unblinded outputs the next hand played will score ×0 for.

***

### playBlockedReason

> **playBlockedReason**: `string` \| `null`

Why Play Hand is refused, when a stale card is selected.

***

### preview

> **preview**: \{ `base`: \{ `baseChips`: `number`; `baseMult`: `number`; `description`: `string`; `handType`: `"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"`; \}; `cardIds`: `string`[]; `chips`: \{ `base`: `number`; `outputs`: `number`; `relics`: `number`; `total`: `number`; \}; `finalMult`: `number`; `handType`: `"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"`; `ledger`: `object`[]; `level`: `number`; `mult`: \{ `base`: `number`; `cardsAndRules`: `number`; `relics`: `number`; `total`: `number`; \}; `ruleResults`: `object`[]; `score`: `number`; `xMult`: \{ `factors`: `object`[]; `product`: `number`; \}; `zeroRule`: \{ `ruleIds`: `string`[]; `triggered`: `boolean`; \}; \} \| `null`

Value of the selection from revealed findings only.

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

### previewUnpenalizedMult

> **previewUnpenalizedMult**: `number`

***

### previewUnverified

> **previewUnverified**: `boolean`

Any selected card is inspectable but uninspected.

***

### quota

> **quota**: `number`

***

### relics

> **relics**: `object`[]

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

***

### reward

> **reward**: \{ `choices`: `object`[]; `claimed`: `string` \| `null`; \} \| `null`

A defended encounter's relic offer, or null.

***

### session

> **session**: [`DmcSession`](../../blinding/type-aliases/DmcSession.md)

The DMC session in force.

***

### sessionRefusal

> **sessionRefusal**: `string` \| `null`

Why the session cannot change now, or null.

***

### snapshot

> **snapshot**: `object`

The current population snapshot.

#### capturedAt

> **capturedAt**: `string`

#### id

> **id**: `string` = `identifier`

#### version

> **version**: `number`

***

### spentCount

> **spentCount**: `number`

Cards dealt and since played or discarded: the discard stack.

***

### staleSelected

> **staleSelected**: `string`[]

Selected cards that are stale, in selection order.

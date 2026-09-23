[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/table](../README.md) / TableView

# Interface: TableView

Everything the Card Table renders, derived purely from scenario and state.

## Properties

### canDiscard

> **canDiscard**: `boolean`

***

### canInspect

> **canInspect**: `boolean`

***

### canPlay

> **canPlay**: `boolean`

***

### classification

> **classification**: \{ `handType`: `"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"`; `scoringCardIds`: `string`[]; \} \| `null`

***

### deckRemaining

> **deckRemaining**: `number`

***

### discardsAffordable

> **discardsAffordable**: `number`

***

### drawPile

> **drawPile**: `object`[]

The undealt deck, face down: opaque slots that carry no card data.

#### faceDown

> **faceDown**: `true`

#### slot

> **slot**: `string` = `identifier`

***

### hand

> **hand**: [`TableCardView`](TableCardView.md)[]

***

### handsAffordable

> **handsAffordable**: `number`

***

### inspection

> **inspection**: [`TableInspectionView`](TableInspectionView.md) \| `null`

***

### lastTimeline

> **lastTimeline**: [`TimelineStep`](../../timeline/type-aliases/TimelineStep.md)[] \| `null`

The last played hand as an ordered scoring timeline, for playback.

***

### preview

> **preview**: \{ `base`: \{ `baseChips`: `number`; `baseMult`: `number`; `description`: `string`; `handType`: `"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"`; \}; `cardIds`: `string`[]; `chips`: \{ `base`: `number`; `outputs`: `number`; `relics`: `number`; `total`: `number`; \}; `finalMult`: `number`; `handType`: `"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"`; `ledger`: `object`[]; `mult`: \{ `base`: `number`; `cardsAndRules`: `number`; `relics`: `number`; `total`: `number`; \}; `ruleResults`: `object`[]; `score`: `number`; `xMult`: \{ `factors`: `object`[]; `product`: `number`; \}; `zeroRule`: \{ `ruleIds`: `string`[]; `triggered`: `boolean`; \}; \} \| `null`

Value of the selection from revealed findings only.

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

### spentCount

> **spentCount**: `number`

Cards dealt and since played or discarded: the discard stack.

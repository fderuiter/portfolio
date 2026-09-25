[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/timeline](../README.md) / scoreTimeline

# Function: scoreTimeline()

> **scoreTimeline**(`evaluation`, `context`): [`TimelineStep`](../type-aliases/TimelineStep.md)[]

Turns a hand's evaluation into an ordered, narratable scoring timeline.

The order is: hand base, each scored card (retriggers repeat the card),
rule results, relic contributions, multiplicative factors, the zero-score
rule if triggered, the total, then Blind progress. Every step carries the
running totals, so a player only displays values and never computes them.
Pure and deterministic; the TOTAL step always equals the evaluation.

## Parameters

### evaluation

#### base

\{ `baseChips`: `number`; `baseMult`: `number`; `description`: `string`; `handType`: `"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"`; \} = `HandBaseScoreSchema`

The hand's base at that level: its level-1 base plus the level bonus.

#### base.baseChips

`number` = `nonNegativeInt`

#### base.baseMult

`number` = `nonNegativeInt`

#### base.description

`string` = `...`

#### base.handType

`"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"` = `HandTypeSchema`

#### cardIds

`string`[] = `...`

#### chips

\{ `base`: `number`; `outputs`: `number`; `relics`: `number`; `total`: `number`; \} = `...`

#### chips.base

`number` = `...`

#### chips.outputs

`number` = `...`

#### chips.relics

`number` = `...`

#### chips.total

`number` = `...`

#### finalMult

`number` = `...`

#### handType

`"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"` = `HandTypeSchema`

#### ledger

`object`[] = `...`

#### level

`number` = `...`

The hand type's level this hand was scored at.

#### mult

\{ `base`: `number`; `cardsAndRules`: `number`; `relics`: `number`; `total`: `number`; \} = `...`

#### mult.base

`number` = `...`

#### mult.cardsAndRules

`number` = `...`

#### mult.relics

`number` = `...`

#### mult.total

`number` = `...`

#### ruleResults

`object`[] = `...`

#### score

`number` = `...`

#### xMult

\{ `factors`: `object`[]; `product`: `number`; \} = `...`

#### xMult.factors

`object`[] = `...`

#### xMult.product

`number` = `...`

#### zeroRule

\{ `ruleIds`: `string`[]; `triggered`: `boolean`; \} = `...`

#### zeroRule.ruleIds

`string`[] = `...`

#### zeroRule.triggered

`boolean` = `...`

### context

[`TimelineContext`](../interfaces/TimelineContext.md)

## Returns

[`TimelineStep`](../type-aliases/TimelineStep.md)[]

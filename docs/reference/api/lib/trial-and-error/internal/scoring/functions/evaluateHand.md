[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/scoring](../README.md) / evaluateHand

# Function: evaluateHand()

> **evaluateHand**(`input`): `object`

Scores a hand through the pipeline pinned in #890:
(leveled base hand Chips + Σ output Chips + Σ relic Chips) × (base hand Mult +
Σ card and rule +Mult + Σ relic +Mult) × Π ×Mult. Any rule result with a
`multMultiplier` of 0 triggers the zero-score rule. The base is the hand's
at `input.level` (default 1): `HAND_BASE_SCORES` plus the level bonus.
Pure and deterministic.

## Parameters

### input

#### cards

`object`[] = `...`

#### handType

`"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"` = `HandTypeSchema`

#### level?

`number` = `...`

The hand type's level this run. Absent means level 1.

#### modifiers?

`object`[] = `...`

#### ruleResults

`object`[] = `...`

## Returns

### base

> **base**: `object` = `HandBaseScoreSchema`

The hand's base at that level: its level-1 base plus the level bonus.

#### base.baseChips

> **baseChips**: `number` = `nonNegativeInt`

#### base.baseMult

> **baseMult**: `number` = `nonNegativeInt`

#### base.description

> **description**: `string`

#### base.handType

> **handType**: `"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"` = `HandTypeSchema`

### cardIds

> **cardIds**: `string`[]

### chips

> **chips**: `object`

#### chips.base

> **base**: `number`

#### chips.outputs

> **outputs**: `number`

#### chips.relics

> **relics**: `number`

#### chips.total

> **total**: `number`

### finalMult

> **finalMult**: `number`

### handType

> **handType**: `"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"` = `HandTypeSchema`

### ledger

> **ledger**: `object`[]

### level

> **level**: `number`

The hand type's level this hand was scored at.

### mult

> **mult**: `object`

#### mult.base

> **base**: `number`

#### mult.cardsAndRules

> **cardsAndRules**: `number`

#### mult.relics

> **relics**: `number`

#### mult.total

> **total**: `number`

### ruleResults

> **ruleResults**: `object`[]

### score

> **score**: `number`

### xMult

> **xMult**: `object`

#### xMult.factors

> **factors**: `object`[]

#### xMult.product

> **product**: `number`

### zeroRule

> **zeroRule**: `object`

#### zeroRule.ruleIds

> **ruleIds**: `string`[]

#### zeroRule.triggered

> **triggered**: `boolean`

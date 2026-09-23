[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/table](../README.md) / PlayedHand

# Interface: PlayedHand

The last hand played, for the result plate.

## Properties

### cardIds

> **cardIds**: `string`[]

***

### classification

> **classification**: `object`

#### handType

> **handType**: `"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"` = `HandTypeSchema`

#### scoringCardIds

> **scoringCardIds**: `string`[]

***

### evaluation

> **evaluation**: `object`

#### base

> **base**: `object` = `HandBaseScoreSchema`

##### base.baseChips

> **baseChips**: `number` = `nonNegativeInt`

##### base.baseMult

> **baseMult**: `number` = `nonNegativeInt`

##### base.description

> **description**: `string`

##### base.handType

> **handType**: `"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"` = `HandTypeSchema`

#### cardIds

> **cardIds**: `string`[]

#### chips

> **chips**: `object`

##### chips.base

> **base**: `number`

##### chips.outputs

> **outputs**: `number`

##### chips.relics

> **relics**: `number`

##### chips.total

> **total**: `number`

#### finalMult

> **finalMult**: `number`

#### handType

> **handType**: `"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"` = `HandTypeSchema`

#### ledger

> **ledger**: `object`[]

#### mult

> **mult**: `object`

##### mult.base

> **base**: `number`

##### mult.cardsAndRules

> **cardsAndRules**: `number`

##### mult.relics

> **relics**: `number`

##### mult.total

> **total**: `number`

#### ruleResults

> **ruleResults**: `object`[]

#### score

> **score**: `number`

#### xMult

> **xMult**: `object`

##### xMult.factors

> **factors**: `object`[]

##### xMult.product

> **product**: `number`

#### zeroRule

> **zeroRule**: `object`

##### zeroRule.ruleIds

> **ruleIds**: `string`[]

##### zeroRule.triggered

> **triggered**: `boolean`

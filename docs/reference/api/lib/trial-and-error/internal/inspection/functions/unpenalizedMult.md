[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/inspection](../README.md) / unpenalizedMult

# Function: unpenalizedMult()

> **unpenalizedMult**(`evaluation`): `number`

The +Mult a hand would carry before redline penalties: the slash display.

## Parameters

### evaluation

#### base

\{ `baseChips`: `number`; `baseMult`: `number`; `description`: `string`; `handType`: `"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"`; \} = `HandBaseScoreSchema`

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

## Returns

`number`

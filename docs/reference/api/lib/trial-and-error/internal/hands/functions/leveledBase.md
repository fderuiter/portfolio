[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/hands](../README.md) / leveledBase

# Function: leveledBase()

> **leveledBase**(`handType`, `level?`): `object`

A hand's base Chips and +Mult at a level: `HAND_BASE_SCORES` plus the
level bonus. Levels below 1 (or not whole) count as level 1. Pure.

## Parameters

### handType

`"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"`

### level?

`number` = `1`

## Returns

`object`

### baseChips

> **baseChips**: `number` = `nonNegativeInt`

### baseMult

> **baseMult**: `number` = `nonNegativeInt`

### description

> **description**: `string`

### handType

> **handType**: `"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"` = `HandTypeSchema`

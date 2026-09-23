[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/hands](../README.md) / classifyHand

# Function: classifyHand()

> **classifyHand**(`cards`): \{ `handType`: `"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"`; `scoringCardIds`: `string`[]; \} \| `null`

Detects the best hand a selection makes and which cards score. The player
never declares a hand: every subset of up to five cards is considered, the
highest-ranked hand wins, and ties go to the subset with more Chips, then to
the earliest-selected cards. Cards outside the winning subset are kickers
and do not score. Returns `null` for an empty selection. Pure.

## Parameters

### cards

readonly [`ClassifiableCard`](../type-aliases/ClassifiableCard.md)[]

## Returns

\{ `handType`: `"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"`; `scoringCardIds`: `string`[]; \} \| `null`

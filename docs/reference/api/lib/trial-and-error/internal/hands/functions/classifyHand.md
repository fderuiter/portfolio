[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/hands](../README.md) / classifyHand

# Function: classifyHand()

> **classifyHand**(`cards`, `allowed?`): \{ `handType`: `"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"`; `scoringCardIds`: `string`[]; \} \| `null`

Detects the best hand a selection makes and which cards score. The player
never declares a hand: every subset of up to five cards is considered, the
highest-ranked hand wins, and ties go to the subset with more Chips, then to
the earliest-selected cards. Cards outside the winning subset are kickers
and do not score. Returns `null` for an empty selection. Pure.

With `allowed`, only those hand types are considered, so a staged Boss
that accepts a lower hand is not shadowed by a higher one it refuses
(#1077). When no allowed hand matches, the unrestricted result is
returned, so a refusal can still say what the selection is.

## Parameters

### cards

readonly [`ClassifiableCard`](../type-aliases/ClassifiableCard.md)[]

### allowed?

readonly (`"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"`)[]

## Returns

\{ `handType`: `"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"`; `scoringCardIds`: `string`[]; \} \| `null`

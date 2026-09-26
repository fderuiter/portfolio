[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/table](../README.md) / ScoreLogEntry

# Interface: ScoreLogEntry

One hand in the Blind's score log (#1082), ready to display.

## Properties

### chips

> **chips**: `number`

***

### fired

> **fired**: [`ScoreLogEffect`](ScoreLogEffect.md)[]

Rules, relics and ×Mult factors that fired, in playback order.

***

### handType

> **handType**: `"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"`

***

### level

> **level**: `number`

***

### mult

> **mult**: `number`

***

### name

> **name**: `string`

The hand's display name.

***

### score

> **score**: `number`

***

### zeroLabel

> **zeroLabel**: `string` \| `null`

The zero rule's label when the hand scored ×0, otherwise null.

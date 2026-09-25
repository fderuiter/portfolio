[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/km](../README.md) / KmArmExpected

# Interface: KmArmExpected

What one arm's records support, re-derived from the snapshot.

## Properties

### arm

> **arm**: `"PLACEBO"` \| `"ACTIVE"`

***

### atRisk

> **atRisk**: `number`[]

Subjects at risk at each milestone.

***

### censorTicks

> **censorTicks**: `number`[]

Distinct right-censoring times, ascending.

***

### curve

> **curve**: \[`number`, `number`\][]

The true step function, `[time, survival]`, from `[0, 1]`.

***

### estimates

> **estimates**: `number`[]

Survival at each milestone, to three decimals.

***

### events

> **events**: `number`

***

### n

> **n**: `number`

Subjects in the figure's population with a record: at risk at the origin.

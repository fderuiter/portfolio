[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/km](../README.md) / KmFinding

# Interface: KmFinding

One discrepancy between a KM draft and what its records support.

## Properties

### arm

> **arm**: `"PLACEBO"` \| `"ACTIVE"`

***

### check

> **check**: [`KmCheck`](../type-aliases/KmCheck.md)

***

### evidence

> **evidence**: `string`

***

### expected

> **expected**: `string`

***

### id

> **id**: `string`

Stable identifier: `<check>@<arm>` plus `t<milestone>` where it applies.

***

### milestone

> **milestone**: `number` \| `null`

The milestone time the finding sits at, or null for the whole curve.

***

### observed

> **observed**: `string`

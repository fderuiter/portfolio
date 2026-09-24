[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/run](../README.md) / RunState

# Interface: RunState

Serializable run state: the seed and draw log that make the run
replayable, which Blind of the act is being played, and that Blind's Card
Table. Contains no derived or browser data.

## Properties

### actId

> **actId**: `string`

***

### blindIndex

> **blindIndex**: `number`

Index into the run's Blinds, Small first.

***

### bossId

> **bossId**: `string` \| `null`

The Boss this run faces: drawn from the act's pool, or its fixed Boss.

***

### drawIndex

> **drawIndex**: `number`

The next unused draw index.

***

### draws

> **draws**: [`RunDraw`](RunDraw.md)[]

Every seeded draw so far, in order.

***

### seed

> **seed**: `string`

The run seed. The same seed and the same moves replay identically.

***

### table

> **table**: [`TableState`](../../table/interfaces/TableState.md)

[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/snapshots](../README.md) / SnapshotInvalidation

# Interface: SnapshotInvalidation

The structured record a population transition leaves behind: which subject
moved, why, between which snapshot versions, and every dealt output it
rendered stale.

## Properties

### change

> **change**: `"JOIN"` \| `"LEAVE"`

***

### from

> **from**: `object`

#### capturedAt

> **capturedAt**: `string`

#### id

> **id**: `string` = `identifier`

#### version

> **version**: `number`

***

### populations

> **populations**: (`"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"`)[]

Populations whose membership actually changed, in suit order.

***

### reason

> **reason**: `"DROPOUT"` \| `"PROTOCOL_AMENDMENT"` \| `"SCREEN_FAILURE"` \| `"PROTOCOL_DEVIATION"`

***

### staleCardIds

> **staleCardIds**: `string`[]

Dealt cards compiled against a population that changed.

***

### subjectId

> **subjectId**: `string`

***

### to

> **to**: `object`

#### capturedAt

> **capturedAt**: `string`

#### id

> **id**: `string` = `identifier`

#### version

> **version**: `number`

***

### transitionId

> **transitionId**: `string`

[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/table](../README.md) / StudyHistory

# Interface: StudyHistory

The study's population history: every snapshot version, oldest first (the
last is current), and the invalidation each transition produced. A run
carries it from one Blind into the next.

## Properties

### invalidations

> **invalidations**: [`SnapshotInvalidation`](../../snapshots/interfaces/SnapshotInvalidation.md)[]

***

### snapshots

> **snapshots**: `object`[]

#### capturedAt

> **capturedAt**: `string`

#### id

> **id**: `string` = `identifier`

#### subjects

> **subjects**: `object`[]

#### version

> **version**: `number`

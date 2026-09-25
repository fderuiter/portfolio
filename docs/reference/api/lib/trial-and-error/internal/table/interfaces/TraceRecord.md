[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/table](../README.md) / TraceRecord

# Interface: TraceRecord

One entry in the Blind's inspection audit log: a flagged table cell traced
to the patient Listing rows behind it, and how its discrepancy stands. The
log is kept for end-of-Blind grading, so it outlives the cards in hand.

## Properties

### cardId

> **cardId**: `string`

The summary Table traced.

***

### cell

> **cell**: `object`

#### col

> **col**: `number` = `nonNegativeInt`

#### row

> **row**: `number` = `nonNegativeInt`

***

### findingIds

> **findingIds**: `string`[]

The findings flagged on the cell.

***

### listingId

> **listingId**: `string`

The supporting Listing it was traced into.

***

### matchedSubjectIds

> **matchedSubjectIds**: `string`[]

The subjects the cell counts: the rows the trace line highlights.

***

### resolution

> **resolution**: `"OPEN"` \| `"RESOLVED"`

RESOLVED once every finding on the cell is corrected.

***

### snapshotId

> **snapshotId**: `string`

The population snapshot the Listing rows were filtered on.

***

### subjectIds

> **subjectIds**: `string`[]

Every subject row inspected on the Listing, by USUBJID.

***

### superseded

> **superseded**: `boolean`

The Table was recompiled since: this trace describes an output that no longer exists.

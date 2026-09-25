[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/listing](../README.md) / traceCell

# Function: traceCell()

> **traceCell**(`table`, `snapshot`, `rulebook`, `row`, `col`): [`CellTrace`](../interfaces/CellTrace.md) \| `null`

Traces one summary table cell to its patient Listing rows. Rows are
filtered on the snapshot the table was compiled against and on the SAP
population, restricted to the cell's column arm; a subject is matched
when the cell's statistic counts it (every subject, for an N or a mean).
Returns null for a cell outside the table. Pure.

## Parameters

### table

#### cells

`string`[][] = `...`

#### columns

`object`[] = `...`

#### draftLabel

`string` = `...`

#### id

`string` = `identifier`

#### populationSnapshotId

`string` = `identifier`

#### rows

`object`[] = `...`

#### shellId

`string` = `identifier`

### snapshot

#### capturedAt

`string` = `...`

#### id

`string` = `identifier`

#### subjects

`object`[] = `...`

#### version

`number` = `...`

### rulebook

#### id

`string` = `identifier`

#### meanPrecision

`number` = `...`

#### percentPrecision

`number` = `...`

#### populationAliases

`object`[] = `...`

#### populationSuit

`"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"` = `PopulationTypeSchema`

#### roundingMode

`"HALF_EVEN"` \| `"HALF_AWAY_FROM_ZERO"` \| `"TRUNCATE"` = `RoundingModeSchema`

#### rules

`object`[] = `...`

#### title

`string` = `...`

### row

`number`

### col

`number`

## Returns

[`CellTrace`](../interfaces/CellTrace.md) \| `null`

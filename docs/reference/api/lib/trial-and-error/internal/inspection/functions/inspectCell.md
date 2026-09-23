[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/inspection](../README.md) / inspectCell

# Function: inspectCell()

> **inspectCell**(`table`, `report`, `inspection`, `row`, `col`): [`InspectionOutcome`](../type-aliases/InspectionOutcome.md)

Reveals the findings on one cell. Re-inspecting a cell is a no-op.

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

### report

#### findings

`object`[] = `...`

#### populationN

`number` = `nonNegativeInt`

Subjects in the rulebook's population suit, across all arms.

#### populationSnapshotId

`string` = `identifier`

#### rulebookId

`string` = `identifier`

#### tableId

`string` = `identifier`

### inspection

[`InspectionState`](../interfaces/InspectionState.md)

### row

`number`

### col

`number`

## Returns

[`InspectionOutcome`](../type-aliases/InspectionOutcome.md)

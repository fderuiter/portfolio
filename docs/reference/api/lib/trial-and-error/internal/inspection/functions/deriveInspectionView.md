[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/inspection](../README.md) / deriveInspectionView

# Function: deriveInspectionView()

> **deriveInspectionView**(`table`, `report`, `inspection`): [`InspectionView`](../interfaces/InspectionView.md)

Cell statuses and revealed findings for the review surface.

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

## Returns

[`InspectionView`](../interfaces/InspectionView.md)

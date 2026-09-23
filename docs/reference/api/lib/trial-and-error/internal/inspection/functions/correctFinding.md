[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/inspection](../README.md) / correctFinding

# Function: correctFinding()

> **correctFinding**(`report`, `inspection`, `findingId`): [`InspectionOutcome`](../type-aliases/InspectionOutcome.md)

Corrects a revealed, still-open finding.

## Parameters

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

### findingId

`string`

## Returns

[`InspectionOutcome`](../type-aliases/InspectionOutcome.md)

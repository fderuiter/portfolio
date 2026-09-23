[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/validator](../README.md) / validate

# Function: validate()

> **validate**(`table`, `snapshot`, `rulebook`): `object`

Validates a staged table against a population snapshot and SAP rulebook.

Pure and deterministic: it never mutates its inputs, never reads browser
state or randomness, and returns findings in a stable order (row, column,
category). Denominators are always derived from the snapshot.

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

## Returns

### findings

> **findings**: `object`[]

### populationN

> **populationN**: `number` = `nonNegativeInt`

Subjects in the rulebook's population suit, across all arms.

### populationSnapshotId

> **populationSnapshotId**: `string` = `identifier`

### rulebookId

> **rulebookId**: `string` = `identifier`

### tableId

> **tableId**: `string` = `identifier`

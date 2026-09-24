[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/compile](../README.md) / compileDraft

# Function: compileDraft()

> **compileDraft**(`draft`, `from`, `to`, `rulebook`, `correctedCells?`): `object`

Recompiles a draft against another population snapshot, as a programmer
rerunning the same program on new data.

- A correct cell is recomputed from the new snapshot.
- A cell in `correctedCells` (`row:col`) is recomputed correctly too: the
  reviewer's fix went into the program.
- Any other defect is reproduced by the mechanism that explains it on the
  old snapshot. A precision slip stays a precision slip, and a FAS
  denominator stays a FAS denominator, on the new data.
- A value no mechanism explains is reproduced as typed.

Pure: returns a new table and never modifies its inputs.

## Parameters

### draft

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

### from

#### capturedAt

`string` = `...`

#### id

`string` = `identifier`

#### subjects

`object`[] = `...`

#### version

`number` = `...`

### to

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

### correctedCells?

`ReadonlySet`\<`string`\> = `...`

## Returns

`object`

### cells

> **cells**: `string`[][]

### columns

> **columns**: `object`[]

### draftLabel

> **draftLabel**: `string`

### id

> **id**: `string` = `identifier`

### populationSnapshotId

> **populationSnapshotId**: `string` = `identifier`

### rows

> **rows**: `object`[]

### shellId

> **shellId**: `string` = `identifier`

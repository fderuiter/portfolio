[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/compile](../README.md) / compileShell

# Function: compileShell()

> **compileShell**(`shell`, `id`, `snapshot`, `rulebook`): `object`

Compiles a blank shell against a snapshot, as the programmer running it on
the analysis set the player allocated. `rulebook` names that set as its
population suit, so every cell is printed exactly as the SAP requires.
Pure: the shell and snapshot are never modified.

## Parameters

### shell

`object` & `object`

### id

`string`

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

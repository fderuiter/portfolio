[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/scoring](../README.md) / ruleResultsFor

# Function: ruleResultsFor()

> **ruleResultsFor**(`report`, `rulebook`, `options`): `object`[]

Converts validator findings into scoring consequences.

A corrected finding earns its rule's correction bonus. An unresolved fatal
finding carries `multMultiplier: 0` (the zero-score rule); an unresolved
non-fatal finding is a redline that subtracts its rule's penalty. When no
denominator finding stands, the population's verified subject records are
credited as Chips.

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

### options

[`RuleResultOptions`](../interfaces/RuleResultOptions.md)

## Returns

`object`[]

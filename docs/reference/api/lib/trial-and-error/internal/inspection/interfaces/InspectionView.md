[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/inspection](../README.md) / InspectionView

# Interface: InspectionView

What the review surface renders for one staged output.

## Extended by

- [`TableInspectionView`](../../table/interfaces/TableInspectionView.md)

## Properties

### cells

> **cells**: [`DeskCellView`](DeskCellView.md)[][]

***

### openFindings

> **openFindings**: `object`[]

Revealed findings not yet corrected.

#### category

> **category**: `"DENOMINATOR"` \| `"PRECISION"` \| `"ROUNDING"` \| `"VALUE"` = `QcCategorySchema`

#### cell

> **cell**: `object` = `CellCoordinatesSchema`

##### cell.col

> **col**: `number` = `nonNegativeInt`

##### cell.row

> **row**: `number` = `nonNegativeInt`

#### consequence

> **consequence**: `string`

#### evidence

> **evidence**: `string`

#### expected

> **expected**: `string`

#### id

> **id**: `string`

Stable identifier: `<ruleId>@r<row>c<col>`.

#### observed

> **observed**: `string`

#### rule

> **rule**: `string`

#### ruleId

> **ruleId**: `string` = `identifier`

#### severity

> **severity**: `"FATAL"` \| `"MAJOR"` \| `"MINOR"` = `QcSeveritySchema`

***

### reviewedCells

> **reviewedCells**: `number`

***

### totalCells

> **totalCells**: `number`

***

### visibleFindings

> **visibleFindings**: `object`[]

Findings revealed by inspection, in validator order.

#### category

> **category**: `"DENOMINATOR"` \| `"PRECISION"` \| `"ROUNDING"` \| `"VALUE"` = `QcCategorySchema`

#### cell

> **cell**: `object` = `CellCoordinatesSchema`

##### cell.col

> **col**: `number` = `nonNegativeInt`

##### cell.row

> **row**: `number` = `nonNegativeInt`

#### consequence

> **consequence**: `string`

#### evidence

> **evidence**: `string`

#### expected

> **expected**: `string`

#### id

> **id**: `string`

Stable identifier: `<ruleId>@r<row>c<col>`.

#### observed

> **observed**: `string`

#### rule

> **rule**: `string`

#### ruleId

> **ruleId**: `string` = `identifier`

#### severity

> **severity**: `"FATAL"` \| `"MAJOR"` \| `"MINOR"` = `QcSeveritySchema`

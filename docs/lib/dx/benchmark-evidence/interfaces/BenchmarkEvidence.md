[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dx/benchmark-evidence](../README.md) / BenchmarkEvidence

# Interface: BenchmarkEvidence

## Properties

### assertion

> **assertion**: `object`

#### budgetEnabled

> **budgetEnabled**: `boolean`

#### expectedRoutes

> **expectedRoutes**: `string`[]

***

### browser

> **browser**: `object`

#### engine

> **engine**: `"chromium"`

#### hasTouch

> **hasTouch**: `boolean`

#### headless

> **headless**: `boolean`

#### isMobile

> **isMobile**: `boolean`

#### viewport

> **viewport**: `object`

##### viewport.height

> **height**: `number`

##### viewport.width

> **width**: `number`

***

### build

> **build**: `object`

#### buildId

> **buildId**: `string` \| `null`

#### command

> **command**: `string` \| `null`

#### completedAt

> **completedAt**: `string` \| `null`

#### fresh

> **fresh**: `boolean`

#### mode

> **mode**: `"unknown"` \| `"development"` \| `"production"`

#### sourceDirty

> **sourceDirty**: `boolean` \| `null`

#### sourceRevision

> **sourceRevision**: `string` \| `null`

***

### capturedAt

> **capturedAt**: `string`

***

### mode

> **mode**: `"production"` \| `"exploratory"`

***

### routes

> **routes**: [`PageBenchmarkSummary`](../../page-bench/interfaces/PageBenchmarkSummary.md)[]

***

### sampling

> **sampling**: `object`

#### measuredRuns

> **measuredRuns**: `number`

#### warmupRuns

> **warmupRuns**: `number`

***

### source

> **source**: `object`

#### dirty

> **dirty**: `boolean`

#### revision

> **revision**: `string`

***

### target

> **target**: `object`

#### hostname

> **hostname**: `string`

#### ownership

> **ownership**: `"benchmark"` \| `"external"`

#### port

> **port**: `number`

#### serverMode

> **serverMode**: `"unknown"` \| `"development"` \| `"production"`

#### startupDiagnostics

> **startupDiagnostics**: `string`

#### url

> **url**: `string`

***

### version

> **version**: `1`

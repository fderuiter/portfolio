[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dx/benchmark-evidence](../README.md) / BenchmarkEvidence

# Interface: BenchmarkEvidence

Defined in: [lib/dx/benchmark-evidence.ts:14](https://github.com/fderuiter/portfolio/blob/main/lib/dx/benchmark-evidence.ts#L14)

## Properties

### assertion

> **assertion**: `object`

Defined in: [lib/dx/benchmark-evidence.ts:50](https://github.com/fderuiter/portfolio/blob/main/lib/dx/benchmark-evidence.ts#L50)

#### budgetEnabled

> **budgetEnabled**: `boolean`

#### expectedRoutes

> **expectedRoutes**: `string`[]

***

### browser

> **browser**: `object`

Defined in: [lib/dx/benchmark-evidence.ts:39](https://github.com/fderuiter/portfolio/blob/main/lib/dx/benchmark-evidence.ts#L39)

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

Defined in: [lib/dx/benchmark-evidence.ts:22](https://github.com/fderuiter/portfolio/blob/main/lib/dx/benchmark-evidence.ts#L22)

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

Defined in: [lib/dx/benchmark-evidence.ts:17](https://github.com/fderuiter/portfolio/blob/main/lib/dx/benchmark-evidence.ts#L17)

***

### mode

> **mode**: `"production"` \| `"exploratory"`

Defined in: [lib/dx/benchmark-evidence.ts:16](https://github.com/fderuiter/portfolio/blob/main/lib/dx/benchmark-evidence.ts#L16)

***

### routes

> **routes**: [`PageBenchmarkSummary`](../../page-bench/interfaces/PageBenchmarkSummary.md)[]

Defined in: [lib/dx/benchmark-evidence.ts:54](https://github.com/fderuiter/portfolio/blob/main/lib/dx/benchmark-evidence.ts#L54)

***

### sampling

> **sampling**: `object`

Defined in: [lib/dx/benchmark-evidence.ts:46](https://github.com/fderuiter/portfolio/blob/main/lib/dx/benchmark-evidence.ts#L46)

#### measuredRuns

> **measuredRuns**: `number`

#### warmupRuns

> **warmupRuns**: `number`

***

### source

> **source**: `object`

Defined in: [lib/dx/benchmark-evidence.ts:18](https://github.com/fderuiter/portfolio/blob/main/lib/dx/benchmark-evidence.ts#L18)

#### dirty

> **dirty**: `boolean`

#### revision

> **revision**: `string`

***

### target

> **target**: `object`

Defined in: [lib/dx/benchmark-evidence.ts:31](https://github.com/fderuiter/portfolio/blob/main/lib/dx/benchmark-evidence.ts#L31)

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

Defined in: [lib/dx/benchmark-evidence.ts:15](https://github.com/fderuiter/portfolio/blob/main/lib/dx/benchmark-evidence.ts#L15)

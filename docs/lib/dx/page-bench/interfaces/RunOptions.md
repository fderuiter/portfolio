[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dx/page-bench](../README.md) / RunOptions

# Interface: RunOptions

Defined in: [lib/dx/page-bench.ts:240](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L240)

## Properties

### baseUrl?

> `optional` **baseUrl?**: `string`

Defined in: [lib/dx/page-bench.ts:241](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L241)

***

### device?

> `optional` **device?**: `object`

Defined in: [lib/dx/page-bench.ts:246](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L246)

#### hasTouch?

> `optional` **hasTouch?**: `boolean`

#### isMobile?

> `optional` **isMobile?**: `boolean`

#### userAgent?

> `optional` **userAgent?**: `string`

#### viewport

> **viewport**: `object`

##### viewport.height

> **height**: `number`

##### viewport.width

> **width**: `number`

***

### isMobile?

> `optional` **isMobile?**: `boolean`

Defined in: [lib/dx/page-bench.ts:245](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L245)

***

### onProgress?

> `optional` **onProgress?**: (`progress`) => `void`

Defined in: [lib/dx/page-bench.ts:252](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L252)

#### Parameters

##### progress

###### currentRun

`number`

###### metrics?

[`SingleRunMetrics`](SingleRunMetrics.md)

###### route

[`PageBenchmarkRoute`](PageBenchmarkRoute.md)

###### totalRuns

`number`

#### Returns

`void`

***

### routes?

> `optional` **routes?**: [`PageBenchmarkRoute`](PageBenchmarkRoute.md)[]

Defined in: [lib/dx/page-bench.ts:243](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L243)

***

### runs?

> `optional` **runs?**: `number`

Defined in: [lib/dx/page-bench.ts:242](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L242)

***

### thresholds?

> `optional` **thresholds?**: [`BenchmarkThresholds`](BenchmarkThresholds.md)

Defined in: [lib/dx/page-bench.ts:244](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L244)

[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dx/page-bench](../README.md) / RunOptions

# Interface: RunOptions

Defined in: [lib/dx/page-bench.ts:242](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L242)

## Properties

### baseUrl?

> `optional` **baseUrl?**: `string`

Defined in: [lib/dx/page-bench.ts:243](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L243)

***

### device?

> `optional` **device?**: `object`

Defined in: [lib/dx/page-bench.ts:248](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L248)

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

Defined in: [lib/dx/page-bench.ts:247](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L247)

***

### onProgress?

> `optional` **onProgress?**: (`progress`) => `void`

Defined in: [lib/dx/page-bench.ts:254](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L254)

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

Defined in: [lib/dx/page-bench.ts:245](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L245)

***

### runs?

> `optional` **runs?**: `number`

Defined in: [lib/dx/page-bench.ts:244](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L244)

***

### thresholds?

> `optional` **thresholds?**: [`BenchmarkThresholds`](BenchmarkThresholds.md)

Defined in: [lib/dx/page-bench.ts:246](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L246)

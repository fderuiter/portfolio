[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dx/page-bench](../README.md) / RunOptions

# Interface: RunOptions

Defined in: [lib/dx/page-bench.ts:237](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L237)

## Properties

### baseUrl?

> `optional` **baseUrl?**: `string`

Defined in: [lib/dx/page-bench.ts:238](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L238)

***

### device?

> `optional` **device?**: `object`

Defined in: [lib/dx/page-bench.ts:243](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L243)

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

Defined in: [lib/dx/page-bench.ts:242](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L242)

***

### onProgress?

> `optional` **onProgress?**: (`progress`) => `void`

Defined in: [lib/dx/page-bench.ts:249](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L249)

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

Defined in: [lib/dx/page-bench.ts:240](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L240)

***

### runs?

> `optional` **runs?**: `number`

Defined in: [lib/dx/page-bench.ts:239](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L239)

***

### thresholds?

> `optional` **thresholds?**: [`BenchmarkThresholds`](BenchmarkThresholds.md)

Defined in: [lib/dx/page-bench.ts:241](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L241)

[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dx/page-bench](../README.md) / RunOptions

# Interface: RunOptions

Defined in: [lib/dx/page-bench.ts:234](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L234)

## Properties

### baseUrl?

> `optional` **baseUrl?**: `string`

Defined in: [lib/dx/page-bench.ts:235](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L235)

***

### device?

> `optional` **device?**: `object`

Defined in: [lib/dx/page-bench.ts:240](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L240)

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

Defined in: [lib/dx/page-bench.ts:239](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L239)

***

### onProgress?

> `optional` **onProgress?**: (`progress`) => `void`

Defined in: [lib/dx/page-bench.ts:246](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L246)

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

Defined in: [lib/dx/page-bench.ts:237](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L237)

***

### runs?

> `optional` **runs?**: `number`

Defined in: [lib/dx/page-bench.ts:236](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L236)

***

### thresholds?

> `optional` **thresholds?**: [`BenchmarkThresholds`](BenchmarkThresholds.md)

Defined in: [lib/dx/page-bench.ts:238](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L238)

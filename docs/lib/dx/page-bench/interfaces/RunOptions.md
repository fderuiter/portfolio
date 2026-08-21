[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dx/page-bench](../README.md) / RunOptions

# Interface: RunOptions

Defined in: [lib/dx/page-bench.ts:373](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L373)

## Properties

### baseUrl?

> `optional` **baseUrl?**: `string`

Defined in: [lib/dx/page-bench.ts:374](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L374)

***

### device?

> `optional` **device?**: `object`

Defined in: [lib/dx/page-bench.ts:379](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L379)

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

Defined in: [lib/dx/page-bench.ts:378](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L378)

***

### onProgress?

> `optional` **onProgress?**: (`progress`) => `void`

Defined in: [lib/dx/page-bench.ts:385](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L385)

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

Defined in: [lib/dx/page-bench.ts:376](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L376)

***

### runs?

> `optional` **runs?**: `number`

Defined in: [lib/dx/page-bench.ts:375](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L375)

***

### thresholds?

> `optional` **thresholds?**: [`BenchmarkThresholds`](BenchmarkThresholds.md)

Defined in: [lib/dx/page-bench.ts:377](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L377)

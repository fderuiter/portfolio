[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dx/page-bench](../README.md) / RunOptions

# Interface: RunOptions

Defined in: [lib/dx/page-bench.ts:247](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L247)

## Properties

### baseUrl?

> `optional` **baseUrl?**: `string`

Defined in: [lib/dx/page-bench.ts:248](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L248)

***

### device?

> `optional` **device?**: `object`

Defined in: [lib/dx/page-bench.ts:253](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L253)

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

Defined in: [lib/dx/page-bench.ts:252](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L252)

***

### onProgress?

> `optional` **onProgress?**: (`progress`) => `void`

Defined in: [lib/dx/page-bench.ts:259](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L259)

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

Defined in: [lib/dx/page-bench.ts:250](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L250)

***

### runs?

> `optional` **runs?**: `number`

Defined in: [lib/dx/page-bench.ts:249](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L249)

***

### thresholds?

> `optional` **thresholds?**: [`BenchmarkThresholds`](BenchmarkThresholds.md)

Defined in: [lib/dx/page-bench.ts:251](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L251)

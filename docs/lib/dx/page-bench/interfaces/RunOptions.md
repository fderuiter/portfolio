[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dx/page-bench](../README.md) / RunOptions

# Interface: RunOptions

Defined in: [lib/dx/page-bench.ts:231](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L231)

## Properties

### baseUrl?

> `optional` **baseUrl?**: `string`

Defined in: [lib/dx/page-bench.ts:232](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L232)

***

### onProgress?

> `optional` **onProgress?**: (`progress`) => `void`

Defined in: [lib/dx/page-bench.ts:236](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L236)

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

Defined in: [lib/dx/page-bench.ts:234](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L234)

***

### runs?

> `optional` **runs?**: `number`

Defined in: [lib/dx/page-bench.ts:233](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L233)

***

### thresholds?

> `optional` **thresholds?**: [`BenchmarkThresholds`](BenchmarkThresholds.md)

Defined in: [lib/dx/page-bench.ts:235](https://github.com/fderuiter/portfolio/blob/main/lib/dx/page-bench.ts#L235)

[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dx/page-bench](../README.md) / RunOptions

# Interface: RunOptions

## Properties

### baseUrl?

> `optional` **baseUrl?**: `string`

***

### device?

> `optional` **device?**: `object`

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

***

### onProgress?

> `optional` **onProgress?**: (`progress`) => `void`

#### Parameters

##### progress

###### currentRun

`number`

###### metrics?

[`SingleRunMetrics`](SingleRunMetrics.md)

###### route

[`PublicRouteDefinition`](../../../public-routes/interfaces/PublicRouteDefinition.md)

###### totalRuns

`number`

#### Returns

`void`

***

### routes?

> `optional` **routes?**: [`PublicRouteDefinition`](../../../public-routes/interfaces/PublicRouteDefinition.md)[]

***

### runs?

> `optional` **runs?**: `number`

***

### thresholds?

> `optional` **thresholds?**: [`BenchmarkThresholds`](BenchmarkThresholds.md)

***

### throttled?

> `optional` **throttled?**: `boolean`

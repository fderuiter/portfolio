[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dx/benchmark-runner](../README.md) / BenchmarkExecutionDependencies

# Interface: BenchmarkExecutionDependencies

Injectable side effects keep production lifecycle behavior testable.

## Properties

### buildProduction

> **buildProduction**: (`source`) => `Promise`\<[`ProductionBuildResult`](ProductionBuildResult.md)\>

#### Parameters

##### source

[`BenchmarkSourceState`](BenchmarkSourceState.md)

#### Returns

`Promise`\<[`ProductionBuildResult`](ProductionBuildResult.md)\>

***

### inspectSource

> **inspectSource**: () => [`BenchmarkSourceState`](BenchmarkSourceState.md)

#### Returns

[`BenchmarkSourceState`](BenchmarkSourceState.md)

***

### now?

> `optional` **now?**: () => `Date`

#### Returns

`Date`

***

### runPageBenchmarks

> **runPageBenchmarks**: (`input`) => `Promise`\<[`PageBenchmarkSummary`](../../page-bench/interfaces/PageBenchmarkSummary.md)[]\>

#### Parameters

##### input

###### baseUrl

`string`

###### isMobile

`boolean`

###### runs

`number`

#### Returns

`Promise`\<[`PageBenchmarkSummary`](../../page-bench/interfaces/PageBenchmarkSummary.md)[]\>

***

### startProductionServer

> **startProductionServer**: (`target`) => `Promise`\<[`OwnedBenchmarkServer`](OwnedBenchmarkServer.md)\>

#### Parameters

##### target

[`BenchmarkTarget`](../../benchmark-evidence/interfaces/BenchmarkTarget.md)

#### Returns

`Promise`\<[`OwnedBenchmarkServer`](OwnedBenchmarkServer.md)\>

***

### waitForServer

> **waitForServer**: (`target`) => `Promise`\<[`ServerReadiness`](ServerReadiness.md)\>

#### Parameters

##### target

[`BenchmarkTarget`](../../benchmark-evidence/interfaces/BenchmarkTarget.md)

#### Returns

`Promise`\<[`ServerReadiness`](ServerReadiness.md)\>

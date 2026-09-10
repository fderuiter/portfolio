[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dx/benchmark-runner](../README.md) / BenchmarkExecutionDependencies

# Interface: BenchmarkExecutionDependencies

Defined in: [lib/dx/benchmark-runner.ts:39](https://github.com/fderuiter/portfolio/blob/main/lib/dx/benchmark-runner.ts#L39)

Injectable side effects keep production lifecycle behavior testable.

## Properties

### buildProduction

> **buildProduction**: (`source`) => `Promise`\<[`ProductionBuildResult`](ProductionBuildResult.md)\>

Defined in: [lib/dx/benchmark-runner.ts:41](https://github.com/fderuiter/portfolio/blob/main/lib/dx/benchmark-runner.ts#L41)

#### Parameters

##### source

[`BenchmarkSourceState`](BenchmarkSourceState.md)

#### Returns

`Promise`\<[`ProductionBuildResult`](ProductionBuildResult.md)\>

***

### inspectSource

> **inspectSource**: () => [`BenchmarkSourceState`](BenchmarkSourceState.md)

Defined in: [lib/dx/benchmark-runner.ts:40](https://github.com/fderuiter/portfolio/blob/main/lib/dx/benchmark-runner.ts#L40)

#### Returns

[`BenchmarkSourceState`](BenchmarkSourceState.md)

***

### now?

> `optional` **now?**: () => `Date`

Defined in: [lib/dx/benchmark-runner.ts:53](https://github.com/fderuiter/portfolio/blob/main/lib/dx/benchmark-runner.ts#L53)

#### Returns

`Date`

***

### runPageBenchmarks

> **runPageBenchmarks**: (`input`) => `Promise`\<[`PageBenchmarkSummary`](../../page-bench/interfaces/PageBenchmarkSummary.md)[]\>

Defined in: [lib/dx/benchmark-runner.ts:48](https://github.com/fderuiter/portfolio/blob/main/lib/dx/benchmark-runner.ts#L48)

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

Defined in: [lib/dx/benchmark-runner.ts:44](https://github.com/fderuiter/portfolio/blob/main/lib/dx/benchmark-runner.ts#L44)

#### Parameters

##### target

[`BenchmarkTarget`](../../benchmark-evidence/interfaces/BenchmarkTarget.md)

#### Returns

`Promise`\<[`OwnedBenchmarkServer`](OwnedBenchmarkServer.md)\>

***

### waitForServer

> **waitForServer**: (`target`) => `Promise`\<[`ServerReadiness`](ServerReadiness.md)\>

Defined in: [lib/dx/benchmark-runner.ts:47](https://github.com/fderuiter/portfolio/blob/main/lib/dx/benchmark-runner.ts#L47)

#### Parameters

##### target

[`BenchmarkTarget`](../../benchmark-evidence/interfaces/BenchmarkTarget.md)

#### Returns

`Promise`\<[`ServerReadiness`](ServerReadiness.md)\>

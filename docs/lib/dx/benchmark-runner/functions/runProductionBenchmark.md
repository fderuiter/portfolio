[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dx/benchmark-runner](../README.md) / runProductionBenchmark

# Function: runProductionBenchmark()

> **runProductionBenchmark**(`options`, `dependencies`): `Promise`\<[`BenchmarkEvidence`](../../benchmark-evidence/interfaces/BenchmarkEvidence.md)\>

Defined in: [lib/dx/benchmark-runner.ts:74](https://github.com/fderuiter/portfolio/blob/main/lib/dx/benchmark-runner.ts#L74)

Builds, owns, measures, validates, and always cleans up a production server.
It intentionally has no path for reusing an arbitrary responding server.

## Parameters

### options

[`ProductionBenchmarkOptions`](../interfaces/ProductionBenchmarkOptions.md)

### dependencies

[`BenchmarkExecutionDependencies`](../interfaces/BenchmarkExecutionDependencies.md)

## Returns

`Promise`\<[`BenchmarkEvidence`](../../benchmark-evidence/interfaces/BenchmarkEvidence.md)\>

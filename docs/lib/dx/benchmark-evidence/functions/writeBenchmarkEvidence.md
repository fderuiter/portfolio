[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dx/benchmark-evidence](../README.md) / writeBenchmarkEvidence

# Function: writeBenchmarkEvidence()

> **writeBenchmarkEvidence**(`evidence`, `outputDirectory?`): `string`

Defined in: [lib/dx/benchmark-evidence.ts:311](https://github.com/fderuiter/portfolio/blob/main/lib/dx/benchmark-evidence.ts#L311)

Writes the result contract atomically so interrupted runs cannot leave partial evidence.

## Parameters

### evidence

[`BenchmarkEvidence`](../interfaces/BenchmarkEvidence.md)

### outputDirectory?

`string` = `DEFAULT_BENCHMARK_EVIDENCE_DIRECTORY`

## Returns

`string`

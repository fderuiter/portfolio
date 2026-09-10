[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dx/benchmark-evidence](../README.md) / createBenchmarkTarget

# Function: createBenchmarkTarget()

> **createBenchmarkTarget**(`value`): [`BenchmarkTarget`](../interfaces/BenchmarkTarget.md)

Defined in: [lib/dx/benchmark-evidence.ts:160](https://github.com/fderuiter/portfolio/blob/main/lib/dx/benchmark-evidence.ts#L160)

Parses an assertion target and permits only a local, plaintext endpoint.
Assertion runs own their server, so remote or pre-existing targets are not evidence.

## Parameters

### value

`string`

## Returns

[`BenchmarkTarget`](../interfaces/BenchmarkTarget.md)

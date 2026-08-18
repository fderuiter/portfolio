[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dx/env-guard](../README.md) / checkRawEnvironmentAccess

# Function: checkRawEnvironmentAccess()

> **checkRawEnvironmentAccess**(`root`): `object`

Defined in: [lib/dx/env-guard.ts:126](https://github.com/fderuiter/portfolio/blob/main/lib/dx/env-guard.ts#L126)

Static analysis check to detect direct raw process.env reads in application code.
Standalone build scripts, setup tools, config files, test suites, and lib/env.ts are exempted.

## Parameters

### root

`string`

## Returns

`object`

### violations

> **violations**: `string`[]

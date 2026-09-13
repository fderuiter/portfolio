[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/seo](../README.md) / getSoftwareSourceCodeSchema

# Function: getSoftwareSourceCodeSchema()

> **getSoftwareSourceCodeSchema**(`study`, `stats`, `options?`): `string`

Returns a specialized SoftwareSourceCode schema for dynamic Case Studies.
Integrates database case study records with cached live GitHub telemetry statistics.

## Parameters

### study

[`BaseCaseStudy`](../../../types/domain/interfaces/BaseCaseStudy.md)

### stats

`Partial`\<[`GitHubStats`](../../github/interfaces/GitHubStats.md)\> \| `null`

### options?

#### inLanguage?

`string`

#### isAccessibleForFree?

`boolean`

## Returns

`string`

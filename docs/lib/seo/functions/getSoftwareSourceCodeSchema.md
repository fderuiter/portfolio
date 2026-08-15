[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/seo](../README.md) / getSoftwareSourceCodeSchema

# Function: getSoftwareSourceCodeSchema()

> **getSoftwareSourceCodeSchema**(`study`, `stats`): `string`

Defined in: [lib/seo.ts:147](https://github.com/fderuiter/portfolio/blob/main/lib/seo.ts#L147)

Returns a specialized SoftwareSourceCode schema for dynamic Case Studies.
Integrates database case study records with cached live GitHub telemetry statistics.

## Parameters

### study

[`BaseCaseStudy`](../../../types/domain/interfaces/BaseCaseStudy.md)

### stats

`Partial`\<[`GitHubStats`](../../github/interfaces/GitHubStats.md)\> \| `null`

## Returns

`string`

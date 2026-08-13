[**temp_dir**](../../../README.md)

***

[temp_dir](../../../modules.md) / [lib/seo](../README.md) / getSoftwareSourceCodeSchema

# Function: getSoftwareSourceCodeSchema()

> **getSoftwareSourceCodeSchema**(`study`, `stats`): `string`

Defined in: [lib/seo.ts:29](https://github.com/fderuiter/portfolio/blob/e9125b13b4fd502f929719e363744f8eb92647bc/lib/seo.ts#L29)

Returns a specialized SoftwareSourceCode schema for dynamic Case Studies.
Integrates database case study records with cached live GitHub telemetry statistics.

## Parameters

### study

[`BaseCaseStudy`](../../../types/domain/interfaces/BaseCaseStudy.md)

### stats

[`GitHubStats`](../../github/interfaces/GitHubStats.md) \| `null`

## Returns

`string`

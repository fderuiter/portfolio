[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/graphics-engine](../README.md) / resolveFontFamily

# Function: resolveFontFamily()

> **resolveFontFamily**(`variableName?`): `string`

Defined in: [lib/graphics-engine.ts:134](https://github.com/fderuiter/portfolio/blob/main/lib/graphics-engine.ts#L134)

Resolves font family variable dynamically using Computed Style.
Returns designManifest sans-serif fallback if run in SSR, unready stylesheet states, or variables are missing.

## Parameters

### variableName?

`string` = `"--font-inter"`

## Returns

`string`

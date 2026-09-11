[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dx/preflight](../README.md) / meetsMinVersion

# Function: meetsMinVersion()

> **meetsMinVersion**(`actual`, `required`): `boolean`

Defined in: [lib/dx/preflight.ts:34](https://github.com/fderuiter/portfolio/blob/main/lib/dx/preflight.ts#L34)

Compares an actual semantic version against a package.json-style
`engines` requirement (currently only the `>=` form used by this
repository's own `package.json` is supported).

## Parameters

### actual

`string`

### required

`string`

## Returns

`boolean`

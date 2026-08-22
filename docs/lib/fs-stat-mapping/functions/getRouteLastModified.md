[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/fs-stat-mapping](../README.md) / getRouteLastModified

# Function: getRouteLastModified()

> **getRouteLastModified**(`routePath`, `fallbackDate?`): `Date`

Defined in: [lib/fs-stat-mapping.ts:20](https://github.com/fderuiter/portfolio/blob/main/lib/fs-stat-mapping.ts#L20)

Inspects source file modification time (mtime) dynamically for a static route path.
Falls back open gracefully to the provided fallbackDate (server boot/generation timestamp)
if the file cannot be statted or does not exist.

## Parameters

### routePath

`string`

### fallbackDate?

`Date` = `...`

## Returns

`Date`

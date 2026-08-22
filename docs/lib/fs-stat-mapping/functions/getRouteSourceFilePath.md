[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/fs-stat-mapping](../README.md) / getRouteSourceFilePath

# Function: getRouteSourceFilePath()

> **getRouteSourceFilePath**(`routePath`): `string`

Defined in: [lib/fs-stat-mapping.ts:9](https://github.com/fderuiter/portfolio/blob/main/lib/fs-stat-mapping.ts#L9)

Resolves the candidate source page file path on disk for a given static route path.
Next.js App Router convention maps routes to page files under the `app` directory.
e.g., '/' -> 'app/page.tsx', '/arcade' -> 'app/arcade/page.tsx'

## Parameters

### routePath

`string`

## Returns

`string`

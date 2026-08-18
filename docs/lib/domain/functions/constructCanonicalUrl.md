[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/domain](../README.md) / constructCanonicalUrl

# Function: constructCanonicalUrl()

> **constructCanonicalUrl**(`path?`): `string`

Defined in: [lib/domain.ts:45](https://github.com/fderuiter/portfolio/blob/main/lib/domain.ts#L45)

Constructs a fully qualified absolute canonical URL by combining the resolved base origin with a normalized route path.
Automatically resolves duplicate/multiple slashes to a single slash, normalizes leading/trailing path slashes,
and strips query parameters or hash fragments.

## Parameters

### path?

`string`

## Returns

`string`

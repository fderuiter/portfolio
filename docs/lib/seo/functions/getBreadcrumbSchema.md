[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/seo](../README.md) / getBreadcrumbSchema

# Function: getBreadcrumbSchema()

> **getBreadcrumbSchema**(`items`, `options?`): `string`

Defined in: [lib/seo.ts:296](https://github.com/fderuiter/portfolio/blob/main/lib/seo.ts#L296)

Returns a Schema.org BreadcrumbList for hierarchical page navigation.
Enforces a single root location entry and securely sanitizes angle brackets against script injection.

## Parameters

### items

[`BreadcrumbItem`](../interfaces/BreadcrumbItem.md)[]

### options?

#### inLanguage?

`string`

#### isAccessibleForFree?

`boolean`

## Returns

`string`

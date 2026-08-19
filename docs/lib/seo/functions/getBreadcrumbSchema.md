[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/seo](../README.md) / getBreadcrumbSchema

# Function: getBreadcrumbSchema()

> **getBreadcrumbSchema**(`items`): `string`

Defined in: [lib/seo.ts:250](https://github.com/fderuiter/portfolio/blob/main/lib/seo.ts#L250)

Returns a Schema.org BreadcrumbList for hierarchical page navigation.
Enforces a single root location entry and securely sanitizes angle brackets against script injection.

## Parameters

### items

[`BreadcrumbItem`](../interfaces/BreadcrumbItem.md)[]

## Returns

`string`

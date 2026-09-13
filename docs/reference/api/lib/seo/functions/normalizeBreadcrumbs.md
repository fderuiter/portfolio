[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/seo](../README.md) / normalizeBreadcrumbs

# Function: normalizeBreadcrumbs()

> **normalizeBreadcrumbs**(`items`): [`BreadcrumbItem`](../interfaces/BreadcrumbItem.md)[]

Normalizes breadcrumb items to enforce a single root location entry across all routes and schemas.
Strips any initial or duplicate root entries (links to "/", empty string, SITE_BASE_URL, or named "Home")
and prepends exactly one root location entry ({ name: "Home", url: "/" }).

## Parameters

### items

[`BreadcrumbItem`](../interfaces/BreadcrumbItem.md)[]

## Returns

[`BreadcrumbItem`](../interfaces/BreadcrumbItem.md)[]

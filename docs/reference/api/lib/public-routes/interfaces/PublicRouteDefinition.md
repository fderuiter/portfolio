[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/public-routes](../README.md) / PublicRouteDefinition

# Interface: PublicRouteDefinition

The public route catalog shared by offline precaching and page benchmarks.

Route membership belongs here so a first-class page cannot be benchmarked
without also being available to the service worker's application shell.

## Properties

### category

> **category**: `"case-study"` \| `"arcade"` \| `"top-level"` \| `"tool"`

***

### name

> **name**: `string`

***

### path

> **path**: `string`

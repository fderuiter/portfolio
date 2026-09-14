[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/services/blog-service](../README.md) / compareBlogPostsNewestFirst

# Function: compareBlogPostsNewestFirst()

> **compareBlogPostsNewestFirst**\<`T`\>(`a`, `b`): `number`

Deterministic newest-first sort comparator for blog post items.
Uses created_at descending with slug ascending as a tie-breaker.
Handles invalid or missing dates safely without returning NaN.

## Type Parameters

### T

`T` *extends* `object`

## Parameters

### a

`T`

### b

`T`

## Returns

`number`

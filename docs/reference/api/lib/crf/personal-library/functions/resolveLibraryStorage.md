[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/personal-library](../README.md) / resolveLibraryStorage

# Function: resolveLibraryStorage()

> **resolveLibraryStorage**(`storage?`): `Storage` \| `undefined`

Resolves a usable Storage, defensively checking that the browser actually
exposes working accessors rather than assuming `window.localStorage` is
present and functional.

## Parameters

### storage?

`Storage`

## Returns

`Storage` \| `undefined`

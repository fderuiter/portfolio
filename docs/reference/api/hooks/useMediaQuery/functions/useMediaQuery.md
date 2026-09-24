[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useMediaQuery](../README.md) / useMediaQuery

# Function: useMediaQuery()

> **useMediaQuery**(`query`): `boolean`

Hydration-safe React hook that subscribes to CSS media query changes.

Uses `useSyncExternalStore` so the initial client render matches the server
render (false) before syncing with window.matchMedia.

## Parameters

### query

`string`

A valid CSS media query string (e.g. "(max-width: 767px)").

## Returns

`boolean`

True if the media query matches, false otherwise.

[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useMediaQuery](../README.md) / useMediaQuery

# Function: useMediaQuery()

> **useMediaQuery**(`query`, `serverSnapshot?`): `boolean`

Hydration-safe React hook that subscribes to CSS media query changes.

Uses `useSyncExternalStore` so the initial client render matches the server
render (false by default) before syncing with window.matchMedia.

## Parameters

### query

`string`

A valid CSS media query string (e.g. "(max-width: 767px)").

### serverSnapshot?

`boolean` = `false`

Optional initial value during server rendering (default: false).

## Returns

`boolean`

True if the media query matches, false otherwise.

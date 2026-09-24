[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useIsMobileViewport](../README.md) / useIsMobileViewport

# Function: useIsMobileViewport()

> **useIsMobileViewport**(): `boolean`

Hydration-safe read of whether the viewport is in the mobile band.

Uses `useMediaQuery` so the first client render agrees with the server render
(which always reports desktop), per the hydration rules in AGENTS.md section 4.

## Returns

`boolean`

True when the viewport matches `(max-width: 767px)`.

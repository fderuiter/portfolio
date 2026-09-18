[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/graphics-engine](../README.md) / isLayoutValidationEnabled

# Function: isLayoutValidationEnabled()

> **isLayoutValidationEnabled**(): `boolean`

Reports whether layout-drift validation is active for the current
environment.

Callers must consult this before measuring the DOM for
`validateLayoutHeight`. The measurement itself is a synchronous
`getBoundingClientRect` read issued from a layout effect that has just
mutated height, which forces the browser to flush layout and blocks the
main thread during hydration. Because the validation is diagnostic only,
production must never pay that cost (#817).

## Returns

`boolean`

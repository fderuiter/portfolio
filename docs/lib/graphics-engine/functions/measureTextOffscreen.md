[**temp_dir**](../../../README.md)

***

[temp_dir](../../../modules.md) / [lib/graphics-engine](../README.md) / measureTextOffscreen

# Function: measureTextOffscreen()

> **measureTextOffscreen**(`__namedParameters`): `object`

Defined in: [lib/graphics-engine.ts:100](https://github.com/fderuiter/portfolio/blob/e9125b13b4fd502f929719e363744f8eb92647bc/lib/graphics-engine.ts#L100)

Offscreen text measurement utilizing Pretext layout calculations.
SSR-safe fallback mechanism returns height 0 if running on server.

## Parameters

### \_\_namedParameters

[`TextMeasurementOptions`](../interfaces/TextMeasurementOptions.md)

## Returns

`object`

### height

> **height**: `number`

### lineCount

> **lineCount**: `number`

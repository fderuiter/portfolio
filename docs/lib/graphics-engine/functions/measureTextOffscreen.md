[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/graphics-engine](../README.md) / measureTextOffscreen

# Function: measureTextOffscreen()

> **measureTextOffscreen**(`__namedParameters`): `object`

Defined in: [lib/graphics-engine.ts:125](https://github.com/fderuiter/portfolio/blob/main/lib/graphics-engine.ts#L125)

Offscreen text measurement utilizing Pretext layout calculations.
SSR-safe fallback mechanism returns height 0 if running on server.

## Parameters

### \_\_namedParameters

#### fontFamilyVariable?

`string` = `"--font-inter"`

#### fontSize

`number`

#### lineHeight

`number`

#### maxWidth

`number`

#### text

`string`

## Returns

`object`

### height

> **height**: `number`

### lineCount

> **lineCount**: `number`

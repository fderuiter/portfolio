[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/graphics-math](../README.md) / extractClientCoordinates

# Function: extractClientCoordinates()

> **extractClientCoordinates**(`e`): [`Point2D`](../type-aliases/Point2D.md) \| `null`

Defined in: [lib/graphics-math.ts:286](https://github.com/fderuiter/portfolio/blob/main/lib/graphics-math.ts#L286)

Extracts client coordinates (clientX, clientY) from either a mouse or touch event object.

## Parameters

### e

#### changedTouches?

`object`[] \| \{\[`key`: `number`\]: `object`; `length`: `number`; \}

#### clientX?

`number`

#### clientY?

`number`

#### touches?

`object`[] \| \{\[`key`: `number`\]: `object`; `length`: `number`; \}

## Returns

[`Point2D`](../type-aliases/Point2D.md) \| `null`

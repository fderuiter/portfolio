[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/graphics-math](../README.md) / getCanvasEventCoordinates

# Function: getCanvasEventCoordinates()

> **getCanvasEventCoordinates**(`e`, `canvas`, `clampToBounds?`): [`Point2D`](../type-aliases/Point2D.md)

Defined in: [lib/graphics-math.ts:321](https://github.com/fderuiter/portfolio/blob/main/lib/graphics-math.ts#L321)

Calculates internal canvas coordinates for either mouse or touch event.
Ensures identical target positions for both mouse and touch inputs at the same screen location.

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

### canvas

#### getBoundingClientRect

() => [`CanvasRect`](../interfaces/CanvasRect.md)

#### height

`number`

#### width

`number`

### clampToBounds?

`boolean` = `false`

## Returns

[`Point2D`](../type-aliases/Point2D.md)

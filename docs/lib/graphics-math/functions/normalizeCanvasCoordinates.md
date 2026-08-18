[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/graphics-math](../README.md) / normalizeCanvasCoordinates

# Function: normalizeCanvasCoordinates()

> **normalizeCanvasCoordinates**(`clientX`, `clientY`, `rect`, `dimensions`, `clampToBounds?`): [`Point2D`](../type-aliases/Point2D.md)

Defined in: [lib/graphics-math.ts:251](https://github.com/fderuiter/portfolio/blob/main/lib/graphics-math.ts#L251)

Normalizes raw screen client coordinates (clientX, clientY) to internal canvas resolution coordinates.
Pure calculation without DOM state dependencies.

## Parameters

### clientX

`number`

### clientY

`number`

### rect

[`CanvasRect`](../interfaces/CanvasRect.md)

### dimensions

[`CanvasDimensions`](../interfaces/CanvasDimensions.md)

### clampToBounds?

`boolean` = `false`

## Returns

[`Point2D`](../type-aliases/Point2D.md)

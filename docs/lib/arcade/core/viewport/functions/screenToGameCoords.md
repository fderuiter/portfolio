[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/arcade/core/viewport](../README.md) / screenToGameCoords

# Function: screenToGameCoords()

> **screenToGameCoords**(`clientX`, `clientY`, `rect`, `metrics`): [`GamePoint`](../interfaces/GamePoint.md)

Defined in: [lib/arcade/core/viewport.ts:123](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/viewport.ts#L123)

Defensively translates client mouse/pointer coordinates to logical game safe zone coordinates.

## Parameters

### clientX

`number`

### clientY

`number`

### rect

`DOMRect` \| \{ `height`: `number`; `left`: `number`; `top`: `number`; `width`: `number`; \}

### metrics

[`ViewportMetrics`](../interfaces/ViewportMetrics.md)

## Returns

[`GamePoint`](../interfaces/GamePoint.md)

[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/webgl/context-manager](../README.md) / simulateContextLoss

# Function: simulateContextLoss()

> **simulateContextLoss**(`canvas`, `restoreDelayMs?`): `boolean`

Triggers a simulated context loss and subsequent restoration on a canvas element.
Uses WEBGL_lose_context extension when available, falling back to synthetic event dispatch.

## Parameters

### canvas

`HTMLCanvasElement`

### restoreDelayMs?

`number` = `800`

## Returns

`boolean`

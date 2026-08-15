[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useWebGLContextLoss](../README.md) / UseWebGLContextLossReturn

# Interface: UseWebGLContextLossReturn

Defined in: [hooks/useWebGLContextLoss.ts:20](https://github.com/fderuiter/portfolio/blob/main/hooks/useWebGLContextLoss.ts#L20)

## Properties

### bindCanvas

> **bindCanvas**: (`canvasElement`) => `void`

Defined in: [hooks/useWebGLContextLoss.ts:25](https://github.com/fderuiter/portfolio/blob/main/hooks/useWebGLContextLoss.ts#L25)

#### Parameters

##### canvasElement

`HTMLCanvasElement` \| `null`

#### Returns

`void`

***

### isLost

> **isLost**: `boolean`

Defined in: [hooks/useWebGLContextLoss.ts:22](https://github.com/fderuiter/portfolio/blob/main/hooks/useWebGLContextLoss.ts#L22)

***

### recoveryCount

> **recoveryCount**: `number`

Defined in: [hooks/useWebGLContextLoss.ts:23](https://github.com/fderuiter/portfolio/blob/main/hooks/useWebGLContextLoss.ts#L23)

***

### status

> **status**: [`ContextLossStatus`](../../../lib/webgl/context-manager/type-aliases/ContextLossStatus.md)

Defined in: [hooks/useWebGLContextLoss.ts:21](https://github.com/fderuiter/portfolio/blob/main/hooks/useWebGLContextLoss.ts#L21)

***

### triggerSimulation

> **triggerSimulation**: (`restoreDelayMs?`) => `boolean`

Defined in: [hooks/useWebGLContextLoss.ts:24](https://github.com/fderuiter/portfolio/blob/main/hooks/useWebGLContextLoss.ts#L24)

#### Parameters

##### restoreDelayMs?

`number`

#### Returns

`boolean`

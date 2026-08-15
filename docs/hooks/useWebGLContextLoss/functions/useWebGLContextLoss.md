[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useWebGLContextLoss](../README.md) / useWebGLContextLoss

# Function: useWebGLContextLoss()

> **useWebGLContextLoss**(`options?`): [`UseWebGLContextLossReturn`](../interfaces/UseWebGLContextLossReturn.md)

Defined in: [hooks/useWebGLContextLoss.ts:33](https://github.com/fderuiter/portfolio/blob/main/hooks/useWebGLContextLoss.ts#L33)

Hook for managing WebGL and Canvas 2D context loss and restoration lifecycles.
Handles event listener binding, preventDefault invocation, screen reader notifications,
and state synchronization across GPU power state switches and mobile suspension.

## Parameters

### options?

[`UseWebGLContextLossOptions`](../interfaces/UseWebGLContextLossOptions.md) = `{}`

## Returns

[`UseWebGLContextLossReturn`](../interfaces/UseWebGLContextLossReturn.md)

[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useResponsiveCanvas](../README.md) / UseResponsiveCanvasReturn

# Interface: UseResponsiveCanvasReturn

Defined in: [hooks/useResponsiveCanvas.ts:23](https://github.com/fderuiter/portfolio/blob/main/hooks/useResponsiveCanvas.ts#L23)

## Properties

### bindCanvas

> **bindCanvas**: (`canvasElement`) => `void`

Defined in: [hooks/useResponsiveCanvas.ts:32](https://github.com/fderuiter/portfolio/blob/main/hooks/useResponsiveCanvas.ts#L32)

#### Parameters

##### canvasElement

`HTMLCanvasElement` \| `null`

#### Returns

`void`

***

### dimensions

> **dimensions**: `object`

Defined in: [hooks/useResponsiveCanvas.ts:25](https://github.com/fderuiter/portfolio/blob/main/hooks/useResponsiveCanvas.ts#L25)

#### height

> **height**: `number`

#### width

> **width**: `number`

***

### dpr

> **dpr**: `number`

Defined in: [hooks/useResponsiveCanvas.ts:24](https://github.com/fderuiter/portfolio/blob/main/hooks/useResponsiveCanvas.ts#L24)

***

### isContextLost

> **isContextLost**: `boolean`

Defined in: [hooks/useResponsiveCanvas.ts:26](https://github.com/fderuiter/portfolio/blob/main/hooks/useResponsiveCanvas.ts#L26)

***

### recoveryCount

> **recoveryCount**: `number`

Defined in: [hooks/useResponsiveCanvas.ts:27](https://github.com/fderuiter/portfolio/blob/main/hooks/useResponsiveCanvas.ts#L27)

***

### toGameCoordinates

> **toGameCoordinates**: (`clientX`, `clientY`) => `object`

Defined in: [hooks/useResponsiveCanvas.ts:28](https://github.com/fderuiter/portfolio/blob/main/hooks/useResponsiveCanvas.ts#L28)

#### Parameters

##### clientX

`number`

##### clientY

`number`

#### Returns

`object`

##### inBounds

> **inBounds**: `boolean`

##### x

> **x**: `number`

##### y

> **y**: `number`

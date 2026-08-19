[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useResponsiveCanvas](../README.md) / UseResponsiveCanvasOptions

# Interface: UseResponsiveCanvasOptions

Defined in: [hooks/useResponsiveCanvas.ts:5](https://github.com/fderuiter/portfolio/blob/main/hooks/useResponsiveCanvas.ts#L5)

## Properties

### canvas?

> `optional` **canvas?**: `HTMLCanvasElement` \| `null`

Defined in: [hooks/useResponsiveCanvas.ts:7](https://github.com/fderuiter/portfolio/blob/main/hooks/useResponsiveCanvas.ts#L7)

***

### canvasRef?

> `optional` **canvasRef?**: `RefObject`\<`HTMLCanvasElement` \| `null`\> \| `null`

Defined in: [hooks/useResponsiveCanvas.ts:6](https://github.com/fderuiter/portfolio/blob/main/hooks/useResponsiveCanvas.ts#L6)

***

### enableContextLossRecovery?

> `optional` **enableContextLossRecovery?**: `boolean`

Defined in: [hooks/useResponsiveCanvas.ts:11](https://github.com/fderuiter/portfolio/blob/main/hooks/useResponsiveCanvas.ts#L11)

***

### internalHeight

> **internalHeight**: `number`

Defined in: [hooks/useResponsiveCanvas.ts:9](https://github.com/fderuiter/portfolio/blob/main/hooks/useResponsiveCanvas.ts#L9)

***

### internalWidth

> **internalWidth**: `number`

Defined in: [hooks/useResponsiveCanvas.ts:8](https://github.com/fderuiter/portfolio/blob/main/hooks/useResponsiveCanvas.ts#L8)

***

### maxDpr?

> `optional` **maxDpr?**: `number`

Defined in: [hooks/useResponsiveCanvas.ts:10](https://github.com/fderuiter/portfolio/blob/main/hooks/useResponsiveCanvas.ts#L10)

***

### onContextLost?

> `optional` **onContextLost?**: (`event`) => `void`

Defined in: [hooks/useResponsiveCanvas.ts:19](https://github.com/fderuiter/portfolio/blob/main/hooks/useResponsiveCanvas.ts#L19)

#### Parameters

##### event

`Event`

#### Returns

`void`

***

### onContextRestored?

> `optional` **onContextRestored?**: (`event`) => `void`

Defined in: [hooks/useResponsiveCanvas.ts:20](https://github.com/fderuiter/portfolio/blob/main/hooks/useResponsiveCanvas.ts#L20)

#### Parameters

##### event

`Event`

#### Returns

`void`

***

### onResize?

> `optional` **onResize?**: (`info`) => `void`

Defined in: [hooks/useResponsiveCanvas.ts:12](https://github.com/fderuiter/portfolio/blob/main/hooks/useResponsiveCanvas.ts#L12)

#### Parameters

##### info

###### dpr

`number`

###### height

`number`

###### scaleX

`number`

###### scaleY

`number`

###### width

`number`

#### Returns

`void`

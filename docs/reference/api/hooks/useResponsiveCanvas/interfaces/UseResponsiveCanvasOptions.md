[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useResponsiveCanvas](../README.md) / UseResponsiveCanvasOptions

# Interface: UseResponsiveCanvasOptions

## Properties

### canvas?

> `optional` **canvas?**: `HTMLCanvasElement` \| `null`

***

### canvasRef?

> `optional` **canvasRef?**: `RefObject`\<`HTMLCanvasElement` \| `null`\> \| `null`

***

### enableContextLossRecovery?

> `optional` **enableContextLossRecovery?**: `boolean`

***

### internalHeight

> **internalHeight**: `number`

***

### internalWidth

> **internalWidth**: `number`

***

### maxDpr?

> `optional` **maxDpr?**: `number`

***

### onContextLost?

> `optional` **onContextLost?**: (`event`) => `void`

#### Parameters

##### event

`Event`

#### Returns

`void`

***

### onContextRestored?

> `optional` **onContextRestored?**: (`event`) => `void`

#### Parameters

##### event

`Event`

#### Returns

`void`

***

### onResize?

> `optional` **onResize?**: (`info`) => `void`

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

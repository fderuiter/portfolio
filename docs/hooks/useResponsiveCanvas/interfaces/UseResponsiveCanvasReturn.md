[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useResponsiveCanvas](../README.md) / UseResponsiveCanvasReturn

# Interface: UseResponsiveCanvasReturn

## Properties

### bindCanvas

> **bindCanvas**: (`canvasElement`) => `void`

#### Parameters

##### canvasElement

`HTMLCanvasElement` \| `null`

#### Returns

`void`

***

### dimensions

> **dimensions**: `object`

#### height

> **height**: `number`

#### width

> **width**: `number`

***

### dpr

> **dpr**: `number`

***

### isContextLost

> **isContextLost**: `boolean`

***

### recoveryCount

> **recoveryCount**: `number`

***

### toGameCoordinates

> **toGameCoordinates**: (`clientX`, `clientY`) => `object`

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

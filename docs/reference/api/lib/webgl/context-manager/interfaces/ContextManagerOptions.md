[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/webgl/context-manager](../README.md) / ContextManagerOptions

# Interface: ContextManagerOptions

## Properties

### autoResetIdleDelayMs?

> `optional` **autoResetIdleDelayMs?**: `number`

***

### canvas

> **canvas**: `HTMLCanvasElement` \| `null`

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

### onStatusChange?

> `optional` **onStatusChange?**: (`status`) => `void`

#### Parameters

##### status

[`ContextLossStatus`](../type-aliases/ContextLossStatus.md)

#### Returns

`void`

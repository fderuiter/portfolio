[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/webgl/context-manager](../README.md) / ContextManagerOptions

# Interface: ContextManagerOptions

Defined in: [lib/webgl/context-manager.ts:11](https://github.com/fderuiter/portfolio/blob/main/lib/webgl/context-manager.ts#L11)

## Properties

### autoResetIdleDelayMs?

> `optional` **autoResetIdleDelayMs?**: `number`

Defined in: [lib/webgl/context-manager.ts:16](https://github.com/fderuiter/portfolio/blob/main/lib/webgl/context-manager.ts#L16)

***

### canvas

> **canvas**: `HTMLCanvasElement` \| `null`

Defined in: [lib/webgl/context-manager.ts:12](https://github.com/fderuiter/portfolio/blob/main/lib/webgl/context-manager.ts#L12)

***

### onContextLost?

> `optional` **onContextLost?**: (`event`) => `void`

Defined in: [lib/webgl/context-manager.ts:13](https://github.com/fderuiter/portfolio/blob/main/lib/webgl/context-manager.ts#L13)

#### Parameters

##### event

`Event`

#### Returns

`void`

***

### onContextRestored?

> `optional` **onContextRestored?**: (`event`) => `void`

Defined in: [lib/webgl/context-manager.ts:14](https://github.com/fderuiter/portfolio/blob/main/lib/webgl/context-manager.ts#L14)

#### Parameters

##### event

`Event`

#### Returns

`void`

***

### onStatusChange?

> `optional` **onStatusChange?**: (`status`) => `void`

Defined in: [lib/webgl/context-manager.ts:15](https://github.com/fderuiter/portfolio/blob/main/lib/webgl/context-manager.ts#L15)

#### Parameters

##### status

[`ContextLossStatus`](../type-aliases/ContextLossStatus.md)

#### Returns

`void`

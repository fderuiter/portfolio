[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useVirtualInputBridge](../README.md) / UseVirtualInputBridgeOptions

# Interface: UseVirtualInputBridgeOptions

Defined in: [hooks/useVirtualInputBridge.ts:13](https://github.com/fderuiter/portfolio/blob/main/hooks/useVirtualInputBridge.ts#L13)

## Properties

### bridge?

> `optional` **bridge?**: [`VirtualInputBridge`](../../../lib/virtual-input-bridge/classes/VirtualInputBridge.md)

Defined in: [hooks/useVirtualInputBridge.ts:14](https://github.com/fderuiter/portfolio/blob/main/hooks/useVirtualInputBridge.ts#L14)

***

### canvasRef?

> `optional` **canvasRef?**: `RefObject`\<`HTMLElement` \| `null`\>

Defined in: [hooks/useVirtualInputBridge.ts:15](https://github.com/fderuiter/portfolio/blob/main/hooks/useVirtualInputBridge.ts#L15)

***

### onActionPress?

> `optional` **onActionPress?**: (`actionId`) => `void`

Defined in: [hooks/useVirtualInputBridge.ts:18](https://github.com/fderuiter/portfolio/blob/main/hooks/useVirtualInputBridge.ts#L18)

#### Parameters

##### actionId

`string`

#### Returns

`void`

***

### onActionRelease?

> `optional` **onActionRelease?**: (`actionId`) => `void`

Defined in: [hooks/useVirtualInputBridge.ts:19](https://github.com/fderuiter/portfolio/blob/main/hooks/useVirtualInputBridge.ts#L19)

#### Parameters

##### actionId

`string`

#### Returns

`void`

***

### onDirectionPress?

> `optional` **onDirectionPress?**: (`direction`) => `void`

Defined in: [hooks/useVirtualInputBridge.ts:16](https://github.com/fderuiter/portfolio/blob/main/hooks/useVirtualInputBridge.ts#L16)

#### Parameters

##### direction

[`VirtualInputDirection`](../../../lib/virtual-input-bridge/type-aliases/VirtualInputDirection.md)

#### Returns

`void`

***

### onDirectionRelease?

> `optional` **onDirectionRelease?**: (`direction`) => `void`

Defined in: [hooks/useVirtualInputBridge.ts:17](https://github.com/fderuiter/portfolio/blob/main/hooks/useVirtualInputBridge.ts#L17)

#### Parameters

##### direction

[`VirtualInputDirection`](../../../lib/virtual-input-bridge/type-aliases/VirtualInputDirection.md)

#### Returns

`void`

***

### onPointerDrag?

> `optional` **onPointerDrag?**: (`point`) => `void`

Defined in: [hooks/useVirtualInputBridge.ts:20](https://github.com/fderuiter/portfolio/blob/main/hooks/useVirtualInputBridge.ts#L20)

#### Parameters

##### point

[`VirtualPointerPoint`](../../../lib/virtual-input-bridge/interfaces/VirtualPointerPoint.md)

#### Returns

`void`

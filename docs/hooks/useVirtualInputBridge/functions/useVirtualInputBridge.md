[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useVirtualInputBridge](../README.md) / useVirtualInputBridge

# Function: useVirtualInputBridge()

> **useVirtualInputBridge**(`options?`): `object`

Defined in: [hooks/useVirtualInputBridge.ts:23](https://github.com/fderuiter/portfolio/blob/main/hooks/useVirtualInputBridge.ts#L23)

## Parameters

### options?

[`UseVirtualInputBridgeOptions`](../interfaces/UseVirtualInputBridgeOptions.md) = `{}`

## Returns

`object`

### bridge

> **bridge**: [`VirtualInputBridge`](../../../lib/virtual-input-bridge/classes/VirtualInputBridge.md)

### emitActionPress

> **emitActionPress**: (`actionId`, `feedback`) => `void`

#### Parameters

##### actionId

`string`

##### feedback?

`boolean` = `true`

#### Returns

`void`

### emitActionRelease

> **emitActionRelease**: (`actionId`) => `void`

#### Parameters

##### actionId

`string`

#### Returns

`void`

### emitDirectionPress

> **emitDirectionPress**: (`direction`, `feedback`) => `void`

#### Parameters

##### direction

[`VirtualInputDirection`](../../../lib/virtual-input-bridge/type-aliases/VirtualInputDirection.md)

##### feedback?

`boolean` = `true`

#### Returns

`void`

### emitDirectionRelease

> **emitDirectionRelease**: (`direction`) => `void`

#### Parameters

##### direction

[`VirtualInputDirection`](../../../lib/virtual-input-bridge/type-aliases/VirtualInputDirection.md)

#### Returns

`void`

### emitPointerDrag

> **emitPointerDrag**: (`point`) => `void`

#### Parameters

##### point

[`VirtualPointerPoint`](../../../lib/virtual-input-bridge/interfaces/VirtualPointerPoint.md)

#### Returns

`void`

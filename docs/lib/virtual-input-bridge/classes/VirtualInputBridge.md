[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/virtual-input-bridge](../README.md) / VirtualInputBridge

# Class: VirtualInputBridge

Defined in: [lib/virtual-input-bridge.ts:116](https://github.com/fderuiter/portfolio/blob/main/lib/virtual-input-bridge.ts#L116)

Shared Virtual Input Bridge Class.

## Constructors

### Constructor

> **new VirtualInputBridge**(): `VirtualInputBridge`

#### Returns

`VirtualInputBridge`

## Methods

### clear()

> **clear**(): `void`

Defined in: [lib/virtual-input-bridge.ts:176](https://github.com/fderuiter/portfolio/blob/main/lib/virtual-input-bridge.ts#L176)

#### Returns

`void`

***

### emitActionPress()

> **emitActionPress**(`actionId`, `feedback?`): `void`

Defined in: [lib/virtual-input-bridge.ts:160](https://github.com/fderuiter/portfolio/blob/main/lib/virtual-input-bridge.ts#L160)

#### Parameters

##### actionId

`string`

##### feedback?

`boolean` = `true`

#### Returns

`void`

***

### emitActionRelease()

> **emitActionRelease**(`actionId`): `void`

Defined in: [lib/virtual-input-bridge.ts:168](https://github.com/fderuiter/portfolio/blob/main/lib/virtual-input-bridge.ts#L168)

#### Parameters

##### actionId

`string`

#### Returns

`void`

***

### emitDirectionPress()

> **emitDirectionPress**(`direction`, `feedback?`): `void`

Defined in: [lib/virtual-input-bridge.ts:148](https://github.com/fderuiter/portfolio/blob/main/lib/virtual-input-bridge.ts#L148)

#### Parameters

##### direction

[`VirtualInputDirection`](../type-aliases/VirtualInputDirection.md)

##### feedback?

`boolean` = `true`

#### Returns

`void`

***

### emitDirectionRelease()

> **emitDirectionRelease**(`direction`): `void`

Defined in: [lib/virtual-input-bridge.ts:156](https://github.com/fderuiter/portfolio/blob/main/lib/virtual-input-bridge.ts#L156)

#### Parameters

##### direction

[`VirtualInputDirection`](../type-aliases/VirtualInputDirection.md)

#### Returns

`void`

***

### emitPointerDrag()

> **emitPointerDrag**(`point`): `void`

Defined in: [lib/virtual-input-bridge.ts:172](https://github.com/fderuiter/portfolio/blob/main/lib/virtual-input-bridge.ts#L172)

#### Parameters

##### point

[`VirtualPointerPoint`](../interfaces/VirtualPointerPoint.md)

#### Returns

`void`

***

### onActionPress()

> **onActionPress**(`listener`): () => `void`

Defined in: [lib/virtual-input-bridge.ts:133](https://github.com/fderuiter/portfolio/blob/main/lib/virtual-input-bridge.ts#L133)

#### Parameters

##### listener

[`ActionListener`](../type-aliases/ActionListener.md)

#### Returns

() => `void`

***

### onActionRelease()

> **onActionRelease**(`listener`): () => `void`

Defined in: [lib/virtual-input-bridge.ts:138](https://github.com/fderuiter/portfolio/blob/main/lib/virtual-input-bridge.ts#L138)

#### Parameters

##### listener

[`ActionListener`](../type-aliases/ActionListener.md)

#### Returns

() => `void`

***

### onDirectionPress()

> **onDirectionPress**(`listener`): () => `void`

Defined in: [lib/virtual-input-bridge.ts:123](https://github.com/fderuiter/portfolio/blob/main/lib/virtual-input-bridge.ts#L123)

#### Parameters

##### listener

[`DirectionListener`](../type-aliases/DirectionListener.md)

#### Returns

() => `void`

***

### onDirectionRelease()

> **onDirectionRelease**(`listener`): () => `void`

Defined in: [lib/virtual-input-bridge.ts:128](https://github.com/fderuiter/portfolio/blob/main/lib/virtual-input-bridge.ts#L128)

#### Parameters

##### listener

[`DirectionListener`](../type-aliases/DirectionListener.md)

#### Returns

() => `void`

***

### onPointerDrag()

> **onPointerDrag**(`listener`): () => `void`

Defined in: [lib/virtual-input-bridge.ts:143](https://github.com/fderuiter/portfolio/blob/main/lib/virtual-input-bridge.ts#L143)

#### Parameters

##### listener

[`PointerDragListener`](../type-aliases/PointerDragListener.md)

#### Returns

() => `void`

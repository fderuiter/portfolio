[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/arcade/core/input](../README.md) / ArcadeInputManager

# Class: ArcadeInputManager

Unified Arcade Input Manager.
Captures Pointer Events, Keyboard events, and virtual ControlDocks buttons,
normalizing them into a single coherent action state vector.

## Constructors

### Constructor

> **new ArcadeInputManager**(): `ArcadeInputManager`

#### Returns

`ArcadeInputManager`

## Methods

### attach()

> **attach**(`canvas`, `getMetrics`): `void`

Attaches DOM event listeners to the canvas and window.

#### Parameters

##### canvas

`HTMLCanvasElement`

##### getMetrics

() => [`ViewportMetrics`](../../viewport/interfaces/ViewportMetrics.md)

#### Returns

`void`

***

### detach()

> **detach**(): `void`

Detaches DOM event listeners cleanly.

#### Returns

`void`

***

### getSnapshot()

> **getSnapshot**(): [`InputSnapshot`](../interfaces/InputSnapshot.md)

Derives normalized input snapshot across all physical and virtual input sources.

#### Returns

[`InputSnapshot`](../interfaces/InputSnapshot.md)

***

### handleKeyDown()

> **handleKeyDown**(`code`): `void`

#### Parameters

##### code

`string`

#### Returns

`void`

***

### handleKeyUp()

> **handleKeyUp**(`code`): `void`

#### Parameters

##### code

`string`

#### Returns

`void`

***

### handlePointerCancel()

> **handlePointerCancel**(): `void`

#### Returns

`void`

***

### handlePointerDown()

> **handlePointerDown**(`e`): `void`

#### Parameters

##### e

###### button?

`number`

###### clientX

`number`

###### clientY

`number`

###### pointerId

`number`

###### pointerType

`string`

#### Returns

`void`

***

### handlePointerMove()

> **handlePointerMove**(`e`): `void`

#### Parameters

##### e

###### clientX

`number`

###### clientY

`number`

###### pointerId

`number`

###### pointerType

`string`

#### Returns

`void`

***

### handlePointerUp()

> **handlePointerUp**(`e`): `void`

#### Parameters

##### e

###### clientX

`number`

###### clientY

`number`

###### pointerId

`number`

###### pointerType

`string`

#### Returns

`void`

***

### reset()

> **reset**(): `void`

#### Returns

`void`

***

### setVirtualAction()

> **setVirtualAction**(`action`, `pressed`): `void`

#### Parameters

##### action

[`VirtualAction`](../type-aliases/VirtualAction.md)

##### pressed

`boolean`

#### Returns

`void`

***

### setVirtualDirection()

> **setVirtualDirection**(`dir`, `pressed`): `void`

#### Parameters

##### dir

[`VirtualDirection`](../type-aliases/VirtualDirection.md)

##### pressed

`boolean`

#### Returns

`void`

***

### setVirtualStick()

> **setVirtualStick**(`x`, `y`): `void`

#### Parameters

##### x

`number`

##### y

`number`

#### Returns

`void`

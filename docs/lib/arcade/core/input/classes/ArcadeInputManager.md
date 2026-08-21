[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/arcade/core/input](../README.md) / ArcadeInputManager

# Class: ArcadeInputManager

Defined in: lib/arcade/core/input.ts:31

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

Defined in: lib/arcade/core/input.ts:60

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

Defined in: lib/arcade/core/input.ts:80

Detaches DOM event listeners cleanly.

#### Returns

`void`

***

### getSnapshot()

> **getSnapshot**(): [`InputSnapshot`](../interfaces/InputSnapshot.md)

Defined in: lib/arcade/core/input.ts:191

Derives normalized input snapshot across all physical and virtual input sources.

#### Returns

[`InputSnapshot`](../interfaces/InputSnapshot.md)

***

### handleKeyDown()

> **handleKeyDown**(`code`): `void`

Defined in: lib/arcade/core/input.ts:115

#### Parameters

##### code

`string`

#### Returns

`void`

***

### handleKeyUp()

> **handleKeyUp**(`code`): `void`

Defined in: lib/arcade/core/input.ts:119

#### Parameters

##### code

`string`

#### Returns

`void`

***

### handlePointerCancel()

> **handlePointerCancel**(): `void`

Defined in: lib/arcade/core/input.ts:165

#### Returns

`void`

***

### handlePointerDown()

> **handlePointerDown**(`e`): `void`

Defined in: lib/arcade/core/input.ts:123

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

Defined in: lib/arcade/core/input.ts:140

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

Defined in: lib/arcade/core/input.ts:153

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

Defined in: lib/arcade/core/input.ts:98

#### Returns

`void`

***

### setVirtualAction()

> **setVirtualAction**(`action`, `pressed`): `void`

Defined in: lib/arcade/core/input.ts:182

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

Defined in: lib/arcade/core/input.ts:169

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

Defined in: lib/arcade/core/input.ts:177

#### Parameters

##### x

`number`

##### y

`number`

#### Returns

`void`

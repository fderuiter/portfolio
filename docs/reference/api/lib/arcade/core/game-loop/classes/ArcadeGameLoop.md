[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/arcade/core/game-loop](../README.md) / ArcadeGameLoop

# Class: ArcadeGameLoop

Deterministic Game Loop utilizing requestAnimationFrame, fixed physics timestep,
accumulator clamping against frame spikes, and sub-frame alpha render interpolation.

## Constructors

### Constructor

> **new ArcadeGameLoop**(`engine`, `getContext?`, `options?`): `ArcadeGameLoop`

#### Parameters

##### engine

[`ArcadeEngine`](../../engine/classes/ArcadeEngine.md)\<`unknown`, `unknown`\>

##### getContext?

() => `CanvasRenderingContext2D` \| `null`

##### options?

[`ArcadeGameLoopOptions`](../interfaces/ArcadeGameLoopOptions.md)

#### Returns

`ArcadeGameLoop`

## Methods

### isPaused()

> **isPaused**(): `boolean`

#### Returns

`boolean`

***

### isRunning()

> **isRunning**(): `boolean`

#### Returns

`boolean`

***

### pause()

> **pause**(): `void`

Pauses simulation updates without tearing down the loop.

#### Returns

`void`

***

### resume()

> **resume**(): `void`

Resumes simulation updates and resets frame timestamps to prevent jump spikes.

#### Returns

`void`

***

### setContextGetter()

> **setContextGetter**(`getter`): `void`

Updates the context getter delegate.

#### Parameters

##### getter

() => `CanvasRenderingContext2D` \| `null`

#### Returns

`void`

***

### start()

> **start**(): `void`

Starts the game loop and invokes engine.init().

#### Returns

`void`

***

### stepOnce()

> **stepOnce**(): `void`

Manually steps the simulation forward by 1 frame (useful for debugging and tests).

#### Returns

`void`

***

### stop()

> **stop**(): `void`

Stops the game loop and cancels active requestAnimationFrames.

#### Returns

`void`

***

### tick()

> **tick**(`deltaMs`): `void`

Drives the accumulator and update steps by an explicit delta time in milliseconds.

#### Parameters

##### deltaMs

`number`

#### Returns

`void`

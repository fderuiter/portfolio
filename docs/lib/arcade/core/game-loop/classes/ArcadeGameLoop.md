[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/arcade/core/game-loop](../README.md) / ArcadeGameLoop

# Class: ArcadeGameLoop

Defined in: lib/arcade/core/game-loop.ts:14

Deterministic Game Loop utilizing requestAnimationFrame, fixed physics timestep,
accumulator clamping against frame spikes, and sub-frame alpha render interpolation.

## Constructors

### Constructor

> **new ArcadeGameLoop**(`engine`, `getContext`, `options?`): `ArcadeGameLoop`

Defined in: lib/arcade/core/game-loop.ts:26

#### Parameters

##### engine

[`ArcadeEngine`](../../engine/classes/ArcadeEngine.md)\<`unknown`, `unknown`\>

##### getContext

() => `CanvasRenderingContext2D` \| `null`

##### options?

[`ArcadeGameLoopOptions`](../interfaces/ArcadeGameLoopOptions.md)

#### Returns

`ArcadeGameLoop`

## Methods

### isPaused()

> **isPaused**(): `boolean`

Defined in: lib/arcade/core/game-loop.ts:86

#### Returns

`boolean`

***

### isRunning()

> **isRunning**(): `boolean`

Defined in: lib/arcade/core/game-loop.ts:82

#### Returns

`boolean`

***

### pause()

> **pause**(): `void`

Defined in: lib/arcade/core/game-loop.ts:69

Pauses simulation updates without tearing down the loop.

#### Returns

`void`

***

### resume()

> **resume**(): `void`

Defined in: lib/arcade/core/game-loop.ts:76

Resumes simulation updates and resets frame timestamps to prevent jump spikes.

#### Returns

`void`

***

### start()

> **start**(): `void`

Defined in: lib/arcade/core/game-loop.ts:40

Starts the game loop and invokes engine.init().

#### Returns

`void`

***

### stepOnce()

> **stepOnce**(): `void`

Defined in: lib/arcade/core/game-loop.ts:93

Manually steps the simulation forward by 1 frame (useful for debugging and tests).

#### Returns

`void`

***

### stop()

> **stop**(): `void`

Defined in: lib/arcade/core/game-loop.ts:57

Stops the game loop and cancels active requestAnimationFrames.

#### Returns

`void`

***

### tick()

> **tick**(`deltaMs`): `void`

Defined in: lib/arcade/core/game-loop.ts:104

Drives the accumulator and update steps by an explicit delta time in milliseconds.

#### Parameters

##### deltaMs

`number`

#### Returns

`void`

[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/arcade/core/game-loop](../README.md) / ArcadeGameLoop

# Class: ArcadeGameLoop

Defined in: [lib/arcade/core/game-loop.ts:14](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/game-loop.ts#L14)

Deterministic Game Loop utilizing requestAnimationFrame, fixed physics timestep,
accumulator clamping against frame spikes, and sub-frame alpha render interpolation.

## Constructors

### Constructor

> **new ArcadeGameLoop**(`engine`, `getContext?`, `options?`): `ArcadeGameLoop`

Defined in: [lib/arcade/core/game-loop.ts:26](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/game-loop.ts#L26)

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

Defined in: [lib/arcade/core/game-loop.ts:99](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/game-loop.ts#L99)

#### Returns

`boolean`

***

### isRunning()

> **isRunning**(): `boolean`

Defined in: [lib/arcade/core/game-loop.ts:95](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/game-loop.ts#L95)

#### Returns

`boolean`

***

### pause()

> **pause**(): `void`

Defined in: [lib/arcade/core/game-loop.ts:82](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/game-loop.ts#L82)

Pauses simulation updates without tearing down the loop.

#### Returns

`void`

***

### resume()

> **resume**(): `void`

Defined in: [lib/arcade/core/game-loop.ts:89](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/game-loop.ts#L89)

Resumes simulation updates and resets frame timestamps to prevent jump spikes.

#### Returns

`void`

***

### setContextGetter()

> **setContextGetter**(`getter`): `void`

Defined in: [lib/arcade/core/game-loop.ts:40](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/game-loop.ts#L40)

Updates the context getter delegate.

#### Parameters

##### getter

() => `CanvasRenderingContext2D` \| `null`

#### Returns

`void`

***

### start()

> **start**(): `void`

Defined in: [lib/arcade/core/game-loop.ts:47](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/game-loop.ts#L47)

Starts the game loop and invokes engine.init().

#### Returns

`void`

***

### stepOnce()

> **stepOnce**(): `void`

Defined in: [lib/arcade/core/game-loop.ts:106](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/game-loop.ts#L106)

Manually steps the simulation forward by 1 frame (useful for debugging and tests).

#### Returns

`void`

***

### stop()

> **stop**(): `void`

Defined in: [lib/arcade/core/game-loop.ts:67](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/game-loop.ts#L67)

Stops the game loop and cancels active requestAnimationFrames.

#### Returns

`void`

***

### tick()

> **tick**(`deltaMs`): `void`

Defined in: [lib/arcade/core/game-loop.ts:117](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/game-loop.ts#L117)

Drives the accumulator and update steps by an explicit delta time in milliseconds.

#### Parameters

##### deltaMs

`number`

#### Returns

`void`

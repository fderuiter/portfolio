[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/retro-labyrinth/engine](../README.md) / RetroLabyrinthEngine

# Class: RetroLabyrinthEngine

Defined in: [lib/retro-labyrinth/engine.ts:88](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L88)

Base abstract class and typed EventBus for all headless arcade game engines.
Zero framework dependencies. Testable in pure Node.js/Vitest.

## Extends

- [`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md)\<[`RetroLabyrinthState`](../interfaces/RetroLabyrinthState.md), [`RetroLabyrinthSnapshot`](../interfaces/RetroLabyrinthSnapshot.md)\>

## Constructors

### Constructor

> **new RetroLabyrinthEngine**(`config?`): `RetroLabyrinthEngine`

Defined in: [lib/retro-labyrinth/engine.ts:94](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L94)

#### Parameters

##### config?

[`RetroLabyrinthConfig`](../interfaces/RetroLabyrinthConfig.md) = `{}`

#### Returns

`RetroLabyrinthEngine`

#### Overrides

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`constructor`](../../../arcade/core/engine/classes/ArcadeEngine.md#constructor)

## Properties

### cachedSnapshot

> `protected` **cachedSnapshot**: [`RetroLabyrinthSnapshot`](../interfaces/RetroLabyrinthSnapshot.md) \| `null` = `null`

Defined in: [lib/arcade/core/engine.ts:8](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L8)

#### Inherited from

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`cachedSnapshot`](../../../arcade/core/engine/classes/ArcadeEngine.md#cachedsnapshot)

***

### state

> `protected` **state**: [`RetroLabyrinthState`](../interfaces/RetroLabyrinthState.md)

Defined in: [lib/arcade/core/engine.ts:7](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L7)

#### Inherited from

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`state`](../../../arcade/core/engine/classes/ArcadeEngine.md#state)

## Methods

### createSnapshot()

> **createSnapshot**(): [`RetroLabyrinthSnapshot`](../interfaces/RetroLabyrinthSnapshot.md)

Defined in: [lib/retro-labyrinth/engine.ts:277](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L277)

Generates a fresh immutable state snapshot.

#### Returns

[`RetroLabyrinthSnapshot`](../interfaces/RetroLabyrinthSnapshot.md)

#### Overrides

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`createSnapshot`](../../../arcade/core/engine/classes/ArcadeEngine.md#createsnapshot)

***

### destroy()

> **destroy**(): `void`

Defined in: [lib/arcade/core/engine.ts:60](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L60)

Cleans up engine timers, event subscriptions, and resources.

#### Returns

`void`

#### Inherited from

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`destroy`](../../../arcade/core/engine/classes/ArcadeEngine.md#destroy)

***

### emit()

> **emit**\<`T`\>(`event`, `payload`): `void`

Defined in: [lib/arcade/core/engine.ts:117](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L117)

Emits a typed event to registered listeners.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### event

`string`

##### payload

`T`

#### Returns

`void`

#### Inherited from

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`emit`](../../../arcade/core/engine/classes/ArcadeEngine.md#emit)

***

### fireActiveWeapon()

> **fireActiveWeapon**(): `void`

Defined in: [lib/retro-labyrinth/engine.ts:327](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L327)

#### Returns

`void`

***

### getSnapshot()

> **getSnapshot**(): [`RetroLabyrinthSnapshot`](../interfaces/RetroLabyrinthSnapshot.md)

Defined in: [lib/arcade/core/engine.ts:43](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L43)

Returns a cached immutable state snapshot for React useSyncExternalStore.
Reference is preserved until notifySubscribers() is explicitly called.

#### Returns

[`RetroLabyrinthSnapshot`](../interfaces/RetroLabyrinthSnapshot.md)

#### Inherited from

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`getSnapshot`](../../../arcade/core/engine/classes/ArcadeEngine.md#getsnapshot)

***

### init()

> **init**(): `void`

Defined in: [lib/retro-labyrinth/engine.ts:168](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L168)

Initializes engine resources, object pools, and audio bindings.

#### Returns

`void`

#### Overrides

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`init`](../../../arcade/core/engine/classes/ArcadeEngine.md#init)

***

### invalidateSnapshot()

> **invalidateSnapshot**(): `void`

Defined in: [lib/arcade/core/engine.ts:78](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L78)

Invalidates cached snapshot so the next getSnapshot() recomputes fresh state.

#### Returns

`void`

#### Inherited from

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`invalidateSnapshot`](../../../arcade/core/engine/classes/ArcadeEngine.md#invalidatesnapshot)

***

### move()

> **move**(`dx`, `dy`): `boolean`

Defined in: [lib/retro-labyrinth/engine.ts:298](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L298)

#### Parameters

##### dx

`number`

##### dy

`number`

#### Returns

`boolean`

***

### notifySubscribers()

> **notifySubscribers**(): `void`

Defined in: [lib/arcade/core/engine.ts:85](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L85)

Invalidates cached snapshot and broadcasts a state change to subscribers.

#### Returns

`void`

#### Inherited from

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`notifySubscribers`](../../../arcade/core/engine/classes/ArcadeEngine.md#notifysubscribers)

***

### on()

> **on**\<`T`\>(`event`, `callback`): () => `void`

Defined in: [lib/arcade/core/engine.ts:95](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L95)

Subscribes to a typed one-shot action event (e.g. sfx, haptic, screen shake).

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### event

`string`

##### callback

(`payload`) => `void`

#### Returns

() => `void`

#### Inherited from

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`on`](../../../arcade/core/engine/classes/ArcadeEngine.md#on)

***

### render()

> **render**(`ctx`, `_alpha`): `void`

Defined in: [lib/retro-labyrinth/engine.ts:219](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L219)

Renders in-world graphics to the 2D canvas with sub-frame alpha interpolation.

#### Parameters

##### ctx

`CanvasRenderingContext2D`

##### \_alpha

`number`

#### Returns

`void`

#### Overrides

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`render`](../../../arcade/core/engine/classes/ArcadeEngine.md#render)

***

### resetGame()

> **resetGame**(): `void`

Defined in: [lib/retro-labyrinth/engine.ts:354](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L354)

#### Returns

`void`

***

### resize()

> **resize**(`_width`, `_height`, `_dpr`): `void`

Defined in: [lib/arcade/core/engine.ts:53](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L53)

Handles canvas dimension and device pixel ratio resize events.

#### Parameters

##### \_width

`number`

##### \_height

`number`

##### \_dpr

`number`

#### Returns

`void`

#### Inherited from

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`resize`](../../../arcade/core/engine/classes/ArcadeEngine.md#resize)

***

### selectWeapon()

> **selectWeapon**(`index`): `void`

Defined in: [lib/retro-labyrinth/engine.ts:341](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L341)

#### Parameters

##### index

`number`

#### Returns

`void`

***

### setCrtTheme()

> **setCrtTheme**(`themeId`): `void`

Defined in: [lib/retro-labyrinth/engine.ts:349](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L349)

#### Parameters

##### themeId

[`CRTThemeId`](../../../dungeon/types/type-aliases/CRTThemeId.md)

#### Returns

`void`

***

### subscribe()

> **subscribe**(`callback`): () => `void`

Defined in: [lib/arcade/core/engine.ts:68](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L68)

Subscribes a listener to snapshot state updates (React useSyncExternalStore).

#### Parameters

##### callback

() => `void`

#### Returns

() => `void`

#### Inherited from

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`subscribe`](../../../arcade/core/engine/classes/ArcadeEngine.md#subscribe)

***

### update()

> **update**(`dt`): `void`

Defined in: [lib/retro-labyrinth/engine.ts:172](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L172)

Advances deterministic simulation physics by fixed delta time dt (in seconds).

#### Parameters

##### dt

`number`

#### Returns

`void`

#### Overrides

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`update`](../../../arcade/core/engine/classes/ArcadeEngine.md#update)

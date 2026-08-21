[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/retro-labyrinth/engine](../README.md) / RetroLabyrinthEngine

# Class: RetroLabyrinthEngine

Defined in: [lib/retro-labyrinth/engine.ts:97](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L97)

Base abstract class and typed EventBus for all headless arcade game engines.
Zero framework dependencies. Testable in pure Node.js/Vitest.

## Extends

- [`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md)\<[`RetroLabyrinthState`](../interfaces/RetroLabyrinthState.md), [`RetroLabyrinthSnapshot`](../interfaces/RetroLabyrinthSnapshot.md)\>

## Constructors

### Constructor

> **new RetroLabyrinthEngine**(`config?`): `RetroLabyrinthEngine`

Defined in: [lib/retro-labyrinth/engine.ts:100](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L100)

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

Defined in: [lib/retro-labyrinth/engine.ts:245](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L245)

Generates a fresh immutable state snapshot.

#### Returns

[`RetroLabyrinthSnapshot`](../interfaces/RetroLabyrinthSnapshot.md)

#### Overrides

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`createSnapshot`](../../../arcade/core/engine/classes/ArcadeEngine.md#createsnapshot)

***

### destroy()

> **destroy**(): `void`

Defined in: [lib/arcade/core/engine.ts:57](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L57)

Cleans up engine timers, event subscriptions, and resources.

#### Returns

`void`

#### Inherited from

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`destroy`](../../../arcade/core/engine/classes/ArcadeEngine.md#destroy)

***

### emit()

> **emit**\<`T`\>(`event`, `payload`): `void`

Defined in: [lib/arcade/core/engine.ts:104](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L104)

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

Defined in: [lib/retro-labyrinth/engine.ts:295](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L295)

#### Returns

`void`

***

### getSnapshot()

> **getSnapshot**(): [`RetroLabyrinthSnapshot`](../interfaces/RetroLabyrinthSnapshot.md)

Defined in: [lib/arcade/core/engine.ts:40](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L40)

Returns a cached immutable state snapshot for React useSyncExternalStore.
Reference is preserved until notifySubscribers() is explicitly called.

#### Returns

[`RetroLabyrinthSnapshot`](../interfaces/RetroLabyrinthSnapshot.md)

#### Inherited from

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`getSnapshot`](../../../arcade/core/engine/classes/ArcadeEngine.md#getsnapshot)

***

### init()

> **init**(): `void`

Defined in: [lib/retro-labyrinth/engine.ts:153](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L153)

Initializes engine resources, object pools, and audio bindings.

#### Returns

`void`

#### Overrides

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`init`](../../../arcade/core/engine/classes/ArcadeEngine.md#init)

***

### move()

> **move**(`dx`, `dy`): `boolean`

Defined in: [lib/retro-labyrinth/engine.ts:266](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L266)

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

Defined in: [lib/arcade/core/engine.ts:75](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L75)

Invalidates cached snapshot and broadcasts a state change to subscribers.

#### Returns

`void`

#### Inherited from

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`notifySubscribers`](../../../arcade/core/engine/classes/ArcadeEngine.md#notifysubscribers)

***

### on()

> **on**\<`T`\>(`event`, `callback`): () => `void`

Defined in: [lib/arcade/core/engine.ts:85](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L85)

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

Defined in: [lib/retro-labyrinth/engine.ts:194](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L194)

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

Defined in: [lib/retro-labyrinth/engine.ts:322](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L322)

#### Returns

`void`

***

### resize()

> **resize**(`_width`, `_height`, `_dpr`): `void`

Defined in: [lib/arcade/core/engine.ts:50](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L50)

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

Defined in: [lib/retro-labyrinth/engine.ts:309](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L309)

#### Parameters

##### index

`number`

#### Returns

`void`

***

### setCrtTheme()

> **setCrtTheme**(`themeId`): `void`

Defined in: [lib/retro-labyrinth/engine.ts:317](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L317)

#### Parameters

##### themeId

[`CRTThemeId`](../../../dungeon/types/type-aliases/CRTThemeId.md)

#### Returns

`void`

***

### subscribe()

> **subscribe**(`callback`): () => `void`

Defined in: [lib/arcade/core/engine.ts:65](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L65)

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

Defined in: [lib/retro-labyrinth/engine.ts:157](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L157)

Advances deterministic simulation physics by fixed delta time dt (in seconds).

#### Parameters

##### dt

`number`

#### Returns

`void`

#### Overrides

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`update`](../../../arcade/core/engine/classes/ArcadeEngine.md#update)

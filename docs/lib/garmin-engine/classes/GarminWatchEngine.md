[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/garmin-engine](../README.md) / GarminWatchEngine

# Class: GarminWatchEngine

Defined in: [lib/garmin-engine.ts:1459](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L1459)

Base abstract class and typed EventBus for all headless arcade game engines.
Zero framework dependencies. Testable in pure Node.js/Vitest.

## Extends

- [`ArcadeEngine`](../../arcade/core/engine/classes/ArcadeEngine.md)\<[`GameEngineState`](../interfaces/GameEngineState.md), [`GarminWatchSnapshot`](../interfaces/GarminWatchSnapshot.md)\>

## Constructors

### Constructor

> **new GarminWatchEngine**(`device?`): `GarminWatchEngine`

Defined in: [lib/garmin-engine.ts:1463](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L1463)

#### Parameters

##### device?

[`DeviceTarget`](../type-aliases/DeviceTarget.md) = `"fenix"`

#### Returns

`GarminWatchEngine`

#### Overrides

[`ArcadeEngine`](../../arcade/core/engine/classes/ArcadeEngine.md).[`constructor`](../../arcade/core/engine/classes/ArcadeEngine.md#constructor)

## Properties

### cachedSnapshot

> `protected` **cachedSnapshot**: [`GarminWatchSnapshot`](../interfaces/GarminWatchSnapshot.md) \| `null` = `null`

Defined in: [lib/arcade/core/engine.ts:8](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L8)

#### Inherited from

[`ArcadeEngine`](../../arcade/core/engine/classes/ArcadeEngine.md).[`cachedSnapshot`](../../arcade/core/engine/classes/ArcadeEngine.md#cachedsnapshot)

***

### state

> `protected` **state**: [`GameEngineState`](../interfaces/GameEngineState.md)

Defined in: [lib/arcade/core/engine.ts:7](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L7)

#### Inherited from

[`ArcadeEngine`](../../arcade/core/engine/classes/ArcadeEngine.md).[`state`](../../arcade/core/engine/classes/ArcadeEngine.md#state)

## Methods

### createSnapshot()

> **createSnapshot**(): [`GarminWatchSnapshot`](../interfaces/GarminWatchSnapshot.md)

Defined in: [lib/garmin-engine.ts:1529](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L1529)

Generates a fresh immutable state snapshot.

#### Returns

[`GarminWatchSnapshot`](../interfaces/GarminWatchSnapshot.md)

#### Overrides

[`ArcadeEngine`](../../arcade/core/engine/classes/ArcadeEngine.md).[`createSnapshot`](../../arcade/core/engine/classes/ArcadeEngine.md#createsnapshot)

***

### destroy()

> **destroy**(): `void`

Defined in: [lib/arcade/core/engine.ts:60](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L60)

Cleans up engine timers, event subscriptions, and resources.

#### Returns

`void`

#### Inherited from

[`ArcadeEngine`](../../arcade/core/engine/classes/ArcadeEngine.md).[`destroy`](../../arcade/core/engine/classes/ArcadeEngine.md#destroy)

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

[`ArcadeEngine`](../../arcade/core/engine/classes/ArcadeEngine.md).[`emit`](../../arcade/core/engine/classes/ArcadeEngine.md#emit)

***

### getSnapshot()

> **getSnapshot**(): [`GarminWatchSnapshot`](../interfaces/GarminWatchSnapshot.md)

Defined in: [lib/arcade/core/engine.ts:43](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L43)

Returns a cached immutable state snapshot for React useSyncExternalStore.
Reference is preserved until notifySubscribers() is explicitly called.

#### Returns

[`GarminWatchSnapshot`](../interfaces/GarminWatchSnapshot.md)

#### Inherited from

[`ArcadeEngine`](../../arcade/core/engine/classes/ArcadeEngine.md).[`getSnapshot`](../../arcade/core/engine/classes/ArcadeEngine.md#getsnapshot)

***

### init()

> **init**(): `void`

Defined in: [lib/garmin-engine.ts:1467](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L1467)

Initializes engine resources, object pools, and audio bindings.

#### Returns

`void`

#### Overrides

[`ArcadeEngine`](../../arcade/core/engine/classes/ArcadeEngine.md).[`init`](../../arcade/core/engine/classes/ArcadeEngine.md#init)

***

### invalidateSnapshot()

> **invalidateSnapshot**(): `void`

Defined in: [lib/arcade/core/engine.ts:78](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L78)

Invalidates cached snapshot so the next getSnapshot() recomputes fresh state.

#### Returns

`void`

#### Inherited from

[`ArcadeEngine`](../../arcade/core/engine/classes/ArcadeEngine.md).[`invalidateSnapshot`](../../arcade/core/engine/classes/ArcadeEngine.md#invalidatesnapshot)

***

### jettisonOldest()

> **jettisonOldest**(): `void`

Defined in: [lib/garmin-engine.ts:1482](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L1482)

#### Returns

`void`

***

### jump()

> **jump**(): `void`

Defined in: [lib/garmin-engine.ts:1488](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L1488)

#### Returns

`void`

***

### notifySubscribers()

> **notifySubscribers**(): `void`

Defined in: [lib/arcade/core/engine.ts:85](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L85)

Invalidates cached snapshot and broadcasts a state change to subscribers.

#### Returns

`void`

#### Inherited from

[`ArcadeEngine`](../../arcade/core/engine/classes/ArcadeEngine.md).[`notifySubscribers`](../../arcade/core/engine/classes/ArcadeEngine.md#notifysubscribers)

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

[`ArcadeEngine`](../../arcade/core/engine/classes/ArcadeEngine.md).[`on`](../../arcade/core/engine/classes/ArcadeEngine.md#on)

***

### pressButton()

> **pressButton**(`btn`): `void`

Defined in: [lib/garmin-engine.ts:1496](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L1496)

#### Parameters

##### btn

`"up"` \| `"down"` \| `"start"` \| `"back"` \| `"light"`

#### Returns

`void`

***

### render()

> **render**(`ctx`, `_alpha`): `void`

Defined in: [lib/garmin-engine.ts:1524](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L1524)

Renders in-world graphics to the 2D canvas with sub-frame alpha interpolation.

#### Parameters

##### ctx

`CanvasRenderingContext2D`

##### \_alpha

`number`

#### Returns

`void`

#### Overrides

[`ArcadeEngine`](../../arcade/core/engine/classes/ArcadeEngine.md).[`render`](../../arcade/core/engine/classes/ArcadeEngine.md#render)

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

[`ArcadeEngine`](../../arcade/core/engine/classes/ArcadeEngine.md).[`resize`](../../arcade/core/engine/classes/ArcadeEngine.md#resize)

***

### startGame()

> **startGame**(): `void`

Defined in: [lib/garmin-engine.ts:1471](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L1471)

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

[`ArcadeEngine`](../../arcade/core/engine/classes/ArcadeEngine.md).[`subscribe`](../../arcade/core/engine/classes/ArcadeEngine.md#subscribe)

***

### triggerGc()

> **triggerGc**(): `void`

Defined in: [lib/garmin-engine.ts:1476](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L1476)

#### Returns

`void`

***

### update()

> **update**(`dt`): `void`

Defined in: [lib/garmin-engine.ts:1517](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L1517)

Advances deterministic simulation physics by fixed delta time dt (in seconds).

#### Parameters

##### dt

`number`

#### Returns

`void`

#### Overrides

[`ArcadeEngine`](../../arcade/core/engine/classes/ArcadeEngine.md).[`update`](../../arcade/core/engine/classes/ArcadeEngine.md#update)

[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/arcade/core/engine](../README.md) / ArcadeEngine

# Abstract Class: ArcadeEngine\<TState, TSnapshot\>

Defined in: [lib/arcade/core/engine.ts:6](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L6)

Base abstract class and typed EventBus for all headless arcade game engines.
Zero framework dependencies. Testable in pure Node.js/Vitest.

## Extended by

- [`RetroLabyrinthEngine`](../../../../retro-labyrinth/engine/classes/RetroLabyrinthEngine.md)

## Type Parameters

### TState

`TState`

### TSnapshot

`TSnapshot`

## Constructors

### Constructor

> **new ArcadeEngine**\<`TState`, `TSnapshot`\>(`initialState`): `ArcadeEngine`\<`TState`, `TSnapshot`\>

Defined in: [lib/arcade/core/engine.ts:12](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L12)

#### Parameters

##### initialState

`TState`

#### Returns

`ArcadeEngine`\<`TState`, `TSnapshot`\>

## Properties

### cachedSnapshot

> `protected` **cachedSnapshot**: `TSnapshot` \| `null` = `null`

Defined in: [lib/arcade/core/engine.ts:8](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L8)

***

### state

> `protected` **state**: `TState`

Defined in: [lib/arcade/core/engine.ts:7](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L7)

## Methods

### createSnapshot()

> `abstract` **createSnapshot**(): `TSnapshot`

Defined in: [lib/arcade/core/engine.ts:34](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L34)

Generates a fresh immutable state snapshot.

#### Returns

`TSnapshot`

***

### destroy()

> **destroy**(): `void`

Defined in: [lib/arcade/core/engine.ts:57](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L57)

Cleans up engine timers, event subscriptions, and resources.

#### Returns

`void`

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

***

### getSnapshot()

> **getSnapshot**(): `TSnapshot`

Defined in: [lib/arcade/core/engine.ts:40](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L40)

Returns a cached immutable state snapshot for React useSyncExternalStore.
Reference is preserved until notifySubscribers() is explicitly called.

#### Returns

`TSnapshot`

***

### init()

> `abstract` **init**(): `void`

Defined in: [lib/arcade/core/engine.ts:19](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L19)

Initializes engine resources, object pools, and audio bindings.

#### Returns

`void`

***

### notifySubscribers()

> **notifySubscribers**(): `void`

Defined in: [lib/arcade/core/engine.ts:75](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L75)

Invalidates cached snapshot and broadcasts a state change to subscribers.

#### Returns

`void`

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

***

### render()

> `abstract` **render**(`ctx`, `alpha`): `void`

Defined in: [lib/arcade/core/engine.ts:29](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L29)

Renders in-world graphics to the 2D canvas with sub-frame alpha interpolation.

#### Parameters

##### ctx

`CanvasRenderingContext2D`

##### alpha

`number`

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

***

### update()

> `abstract` **update**(`dt`): `void`

Defined in: [lib/arcade/core/engine.ts:24](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L24)

Advances deterministic simulation physics by fixed delta time dt (in seconds).

#### Parameters

##### dt

`number`

#### Returns

`void`

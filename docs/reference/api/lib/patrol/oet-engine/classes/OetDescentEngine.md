[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/patrol/oet-engine](../README.md) / OetDescentEngine

# Class: OetDescentEngine

Headless Outdoor Emergency Transportation (OET) Descent Engine.

Implements deterministic 60Hz physics modeling a Cascade 100 rescue toboggan
carrying a packaged patient down a 24° fall-line slope. Rewards operator control,
snowplow/sideslip edge discipline, and chain-brake management over raw descent speed.

Adheres to ADR 0026 and ADR 0019. Testable in pure Node.js/Vitest without DOM dependencies.

## Extends

- [`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md)\<[`OetDescentState`](../../types/interfaces/OetDescentState.md), [`OetDescentSnapshot`](../../types/interfaces/OetDescentSnapshot.md)\>

## Constructors

### Constructor

> **new OetDescentEngine**(`options?`): `OetDescentEngine`

#### Parameters

##### options?

[`OetDescentEngineOptions`](../../types/interfaces/OetDescentEngineOptions.md) = `{}`

#### Returns

`OetDescentEngine`

#### Overrides

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`constructor`](../../../arcade/core/engine/classes/ArcadeEngine.md#constructor)

## Properties

### cachedSnapshot

> `protected` **cachedSnapshot**: [`OetDescentSnapshot`](../../types/interfaces/OetDescentSnapshot.md) \| `null` = `null`

#### Inherited from

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`cachedSnapshot`](../../../arcade/core/engine/classes/ArcadeEngine.md#cachedsnapshot)

***

### state

> `protected` **state**: [`OetDescentState`](../../types/interfaces/OetDescentState.md)

#### Inherited from

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`state`](../../../arcade/core/engine/classes/ArcadeEngine.md#state)

## Methods

### createGameLoop()

> **createGameLoop**(`getContext?`): [`ArcadeGameLoop`](../../../arcade/core/game-loop/classes/ArcadeGameLoop.md)

Instantiates a deterministic fixed-timestep game loop for the OET engine.

#### Parameters

##### getContext?

() => `CanvasRenderingContext2D` \| `null`

#### Returns

[`ArcadeGameLoop`](../../../arcade/core/game-loop/classes/ArcadeGameLoop.md)

***

### createPatrolEventSnapshot()

> **createPatrolEventSnapshot**(`scenarioId?`): [`PatrolEvent`](../../types/interfaces/PatrolEvent.md)

Compiles an immutable PatrolEvent snapshot documenting OET judgment metrics
for debrief and telemetry ingestion (M7).

#### Parameters

##### scenarioId?

`string` = `"pine-ridge-sweep"`

#### Returns

[`PatrolEvent`](../../types/interfaces/PatrolEvent.md)

***

### createSnapshot()

> **createSnapshot**(): [`OetDescentSnapshot`](../../types/interfaces/OetDescentSnapshot.md)

Generates a fresh immutable state snapshot.

#### Returns

[`OetDescentSnapshot`](../../types/interfaces/OetDescentSnapshot.md)

#### Overrides

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`createSnapshot`](../../../arcade/core/engine/classes/ArcadeEngine.md#createsnapshot)

***

### destroy()

> **destroy**(): `void`

Cleans up engine timers, event subscriptions, and resources.

#### Returns

`void`

#### Overrides

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`destroy`](../../../arcade/core/engine/classes/ArcadeEngine.md#destroy)

***

### emit()

> **emit**\<`T`\>(`event`, `payload`): `void`

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

### evaluatePatientTransport()

> **evaluatePatientTransport**(`patient?`, `vitals?`, `environment?`): `object`

Evaluates patient injury severity and transport triage priority for OET response.

#### Parameters

##### patient?

`Partial`\<[`PatientState`](../../types/interfaces/PatientState.md)\>

##### vitals?

[`VitalsData`](../../types/interfaces/VitalsData.md)

##### environment?

[`BriefingState`](../../types/interfaces/BriefingState.md)

#### Returns

`object`

##### priority

> **priority**: [`TransportPriorityAssignment`](../interfaces/TransportPriorityAssignment.md)

##### severity

> **severity**: [`InjurySeverityResult`](../interfaces/InjurySeverityResult.md)

***

### getInputManager()

> **getInputManager**(): [`ArcadeInputManager`](../../../arcade/core/input/classes/ArcadeInputManager.md)

Creates or returns a unified ArcadeInputManager instance bound to the engine.

#### Returns

[`ArcadeInputManager`](../../../arcade/core/input/classes/ArcadeInputManager.md)

***

### getSnapshot()

> **getSnapshot**(): [`OetDescentSnapshot`](../../types/interfaces/OetDescentSnapshot.md)

Returns a cached immutable state snapshot for React useSyncExternalStore.
Reference is preserved until notifySubscribers() is explicitly called.

#### Returns

[`OetDescentSnapshot`](../../types/interfaces/OetDescentSnapshot.md)

#### Inherited from

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`getSnapshot`](../../../arcade/core/engine/classes/ArcadeEngine.md#getsnapshot)

***

### getViewport()

> **getViewport**(): [`ArcadeViewport`](../../../arcade/core/viewport/classes/ArcadeViewport.md)

Returns the viewport instance configuring camera bounds and resolution scaling.

#### Returns

[`ArcadeViewport`](../../../arcade/core/viewport/classes/ArcadeViewport.md)

***

### init()

> **init**(): `void`

Initializes engine resources, object pools, and audio bindings.

#### Returns

`void`

#### Overrides

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`init`](../../../arcade/core/engine/classes/ArcadeEngine.md#init)

***

### invalidateSnapshot()

> **invalidateSnapshot**(): `void`

Invalidates cached snapshot so the next getSnapshot() recomputes fresh state.

#### Returns

`void`

#### Inherited from

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`invalidateSnapshot`](../../../arcade/core/engine/classes/ArcadeEngine.md#invalidatesnapshot)

***

### notifySubscribers()

> **notifySubscribers**(): `void`

Invalidates cached snapshot and broadcasts a state change to subscribers.

#### Returns

`void`

#### Inherited from

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`notifySubscribers`](../../../arcade/core/engine/classes/ArcadeEngine.md#notifysubscribers)

***

### on()

> **on**\<`T`\>(`event`, `callback`): () => `void`

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

### performControlledStop()

> **performControlledStop**(): `void`

#### Returns

`void`

***

### render()

> **render**(`ctx`, `_alpha`): `void`

High-assurance 2D Canvas rendering for sled, fall-line slope, gates, and snow spray.

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

### resize()

> **resize**(`_width`, `_height`, `_dpr`): `void`

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

### setBraking()

> **setBraking**(`braking`): `void`

#### Parameters

##### braking

`boolean`

#### Returns

`void`

***

### setChainBrake()

> **setChainBrake**(`engaged`): `void`

#### Parameters

##### engaged

`boolean`

#### Returns

`void`

***

### setSteering()

> **setSteering**(`val`): `void`

#### Parameters

##### val

`number`

#### Returns

`void`

***

### setTailRope()

> **setTailRope**(`active`): `void`

#### Parameters

##### active

`boolean`

#### Returns

`void`

***

### stepSimulation()

> **stepSimulation**(`stepSeconds?`, `input?`): `void`

Step-through deterministic simulation helper for accessibility and test suites.

#### Parameters

##### stepSeconds?

`number` = `0.5`

##### input?

###### brake?

`boolean`

###### chainBrake?

`boolean`

###### steering?

`number`

###### tailRope?

`boolean`

#### Returns

`void`

***

### subscribe()

> **subscribe**(`callback`): () => `void`

Subscribes a listener to snapshot state updates (React useSyncExternalStore).

#### Parameters

##### callback

() => `void`

#### Returns

() => `void`

#### Inherited from

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`subscribe`](../../../arcade/core/engine/classes/ArcadeEngine.md#subscribe)

***

### toggleChainBrake()

> **toggleChainBrake**(): `void`

#### Returns

`void`

***

### toggleTailRope()

> **toggleTailRope**(): `void`

#### Returns

`void`

***

### update()

> **update**(`dt`): `void`

Advances deterministic physics by fixed delta time dt (in seconds).

#### Parameters

##### dt

`number`

Physics delta time in seconds. Clamped defensively against frame spikes.

#### Returns

`void`

#### Overrides

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`update`](../../../arcade/core/engine/classes/ArcadeEngine.md#update)

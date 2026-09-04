[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/clinical-trial-chaos/engine](../README.md) / ClinicalTrialChaosEngine

# Class: ClinicalTrialChaosEngine

Defined in: [lib/clinical-trial-chaos/engine.ts:877](https://github.com/fderuiter/portfolio/blob/main/lib/clinical-trial-chaos/engine.ts#L877)

Base abstract class and typed EventBus for all headless arcade game engines.
Zero framework dependencies. Testable in pure Node.js/Vitest.

## Extends

- [`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md)\<[`ClinicalTrialChaosState`](../interfaces/ClinicalTrialChaosState.md), [`ClinicalTrialChaosSnapshot`](../interfaces/ClinicalTrialChaosSnapshot.md)\>

## Constructors

### Constructor

> **new ClinicalTrialChaosEngine**(`initialProtocol?`): `ClinicalTrialChaosEngine`

Defined in: [lib/clinical-trial-chaos/engine.ts:881](https://github.com/fderuiter/portfolio/blob/main/lib/clinical-trial-chaos/engine.ts#L881)

#### Parameters

##### initialProtocol?

[`StudyProtocol`](../../../crf/types/interfaces/StudyProtocol.md) \| `null`

#### Returns

`ClinicalTrialChaosEngine`

#### Overrides

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`constructor`](../../../arcade/core/engine/classes/ArcadeEngine.md#constructor)

## Properties

### cachedSnapshot

> `protected` **cachedSnapshot**: [`ClinicalTrialChaosSnapshot`](../interfaces/ClinicalTrialChaosSnapshot.md) \| `null` = `null`

Defined in: [lib/arcade/core/engine.ts:8](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L8)

#### Inherited from

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`cachedSnapshot`](../../../arcade/core/engine/classes/ArcadeEngine.md#cachedsnapshot)

***

### state

> `protected` **state**: [`ClinicalTrialChaosState`](../interfaces/ClinicalTrialChaosState.md)

Defined in: [lib/arcade/core/engine.ts:7](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L7)

#### Inherited from

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`state`](../../../arcade/core/engine/classes/ArcadeEngine.md#state)

## Methods

### activatePowerUp()

> **activatePowerUp**(`id`, `force?`): `void`

Defined in: [lib/clinical-trial-chaos/engine.ts:1083](https://github.com/fderuiter/portfolio/blob/main/lib/clinical-trial-chaos/engine.ts#L1083)

#### Parameters

##### id

[`PowerUpType`](../../types/type-aliases/PowerUpType.md)

##### force?

`boolean` = `true`

#### Returns

`void`

***

### addAuditLog()

> **addAuditLog**(`message`, `level?`, `suspicionDelta?`): `void`

Defined in: [lib/clinical-trial-chaos/engine.ts:931](https://github.com/fderuiter/portfolio/blob/main/lib/clinical-trial-chaos/engine.ts#L931)

#### Parameters

##### message

`string`

##### level?

`"INFO"` \| `"WARN"` \| `"CRITICAL"` \| `"COMPLIANT"`

##### suspicionDelta?

`number` = `0`

#### Returns

`void`

***

### addSubject()

> **addSubject**(`subject`): `void`

Defined in: [lib/clinical-trial-chaos/engine.ts:926](https://github.com/fderuiter/portfolio/blob/main/lib/clinical-trial-chaos/engine.ts#L926)

#### Parameters

##### subject

[`ClinicalSubject`](../../types/interfaces/ClinicalSubject.md)

#### Returns

`void`

***

### createSnapshot()

> **createSnapshot**(): [`ClinicalTrialChaosSnapshot`](../interfaces/ClinicalTrialChaosSnapshot.md)

Defined in: [lib/clinical-trial-chaos/engine.ts:1219](https://github.com/fderuiter/portfolio/blob/main/lib/clinical-trial-chaos/engine.ts#L1219)

Generates a fresh immutable state snapshot.

#### Returns

[`ClinicalTrialChaosSnapshot`](../interfaces/ClinicalTrialChaosSnapshot.md)

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

### getSnapshot()

> **getSnapshot**(): [`ClinicalTrialChaosSnapshot`](../interfaces/ClinicalTrialChaosSnapshot.md)

Defined in: [lib/arcade/core/engine.ts:43](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/engine.ts#L43)

Returns a cached immutable state snapshot for React useSyncExternalStore.
Reference is preserved until notifySubscribers() is explicitly called.

#### Returns

[`ClinicalTrialChaosSnapshot`](../interfaces/ClinicalTrialChaosSnapshot.md)

#### Inherited from

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`getSnapshot`](../../../arcade/core/engine/classes/ArcadeEngine.md#getsnapshot)

***

### init()

> **init**(): `void`

Defined in: [lib/clinical-trial-chaos/engine.ts:897](https://github.com/fderuiter/portfolio/blob/main/lib/clinical-trial-chaos/engine.ts#L897)

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

### isModalPaused()

> **isModalPaused**(): `boolean`

Defined in: [lib/clinical-trial-chaos/engine.ts:922](https://github.com/fderuiter/portfolio/blob/main/lib/clinical-trial-chaos/engine.ts#L922)

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

Defined in: [lib/clinical-trial-chaos/engine.ts:1197](https://github.com/fderuiter/portfolio/blob/main/lib/clinical-trial-chaos/engine.ts#L1197)

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

### resolveObservation()

> **resolveObservation**(`subjectId`, `obsId`, `choice`): `object`

Defined in: [lib/clinical-trial-chaos/engine.ts:942](https://github.com/fderuiter/portfolio/blob/main/lib/clinical-trial-chaos/engine.ts#L942)

#### Parameters

##### subjectId

`string`

##### obsId

`string`

##### choice

`string`

#### Returns

`object`

##### explanation

> **explanation**: `string`

##### isValid

> **isValid**: `boolean`

***

### setModalPause()

> **setModalPause**(`paused`): `void`

Defined in: [lib/clinical-trial-chaos/engine.ts:917](https://github.com/fderuiter/portfolio/blob/main/lib/clinical-trial-chaos/engine.ts#L917)

#### Parameters

##### paused

`boolean`

#### Returns

`void`

***

### setPaused()

> **setPaused**(`paused`): `void`

Defined in: [lib/clinical-trial-chaos/engine.ts:912](https://github.com/fderuiter/portfolio/blob/main/lib/clinical-trial-chaos/engine.ts#L912)

#### Parameters

##### paused

`boolean`

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

Defined in: [lib/clinical-trial-chaos/engine.ts:1117](https://github.com/fderuiter/portfolio/blob/main/lib/clinical-trial-chaos/engine.ts#L1117)

Advances deterministic simulation physics by fixed delta time dt (in seconds).

#### Parameters

##### dt

`number`

#### Returns

`void`

#### Overrides

[`ArcadeEngine`](../../../arcade/core/engine/classes/ArcadeEngine.md).[`update`](../../../arcade/core/engine/classes/ArcadeEngine.md#update)

***

### verifyAndSubmit()

> **verifyAndSubmit**(`subjectId`, `reason`, `targetStation`): `object`

Defined in: [lib/clinical-trial-chaos/engine.ts:1008](https://github.com/fderuiter/portfolio/blob/main/lib/clinical-trial-chaos/engine.ts#L1008)

#### Parameters

##### subjectId

`string`

##### reason

`string`

##### targetStation

[`CDISCDomain`](../../types/type-aliases/CDISCDomain.md)

#### Returns

`object`

##### logMessage

> **logMessage**: `string`

##### success

> **success**: `boolean`

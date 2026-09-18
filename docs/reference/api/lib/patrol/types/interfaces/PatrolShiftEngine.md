[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/patrol/types](../README.md) / PatrolShiftEngine

# Interface: PatrolShiftEngine

## Methods

### dispatch()

> **dispatch**(`event`): `void`

#### Parameters

##### event

[`ShiftEngineEvent`](ShiftEngineEvent.md)

#### Returns

`void`

***

### getEventHistory()

> **getEventHistory**(): [`PatrolEvent`](PatrolEvent.md)[]

#### Returns

[`PatrolEvent`](PatrolEvent.md)[]

***

### getLoadedScenario()

> **getLoadedScenario**(): [`PatrolScenario`](PatrolScenario.md) \| `null`

#### Returns

[`PatrolScenario`](PatrolScenario.md) \| `null`

***

### getState()

> **getState**(): [`ShiftState`](ShiftState.md)

#### Returns

[`ShiftState`](ShiftState.md)

***

### loadScenario()

> **loadScenario**(`scenario`): `void`

#### Parameters

##### scenario

[`PatrolScenario`](PatrolScenario.md)

#### Returns

`void`

***

### subscribe()

> **subscribe**(`listener`): () => `void`

#### Parameters

##### listener

() => `void`

#### Returns

() => `void`

[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/patrol/events](../README.md) / EventQueue

# Class: EventQueue

Managed Event Queue for active shift events.

## Constructors

### Constructor

> **new EventQueue**(`initialEvents?`): `EventQueue`

#### Parameters

##### initialEvents?

[`PatrolEvent`](../../types/interfaces/PatrolEvent.md)[] = `[]`

#### Returns

`EventQueue`

## Methods

### clear()

> **clear**(): `void`

#### Returns

`void`

***

### dequeue()

> **dequeue**(): [`PatrolEvent`](../../types/interfaces/PatrolEvent.md) \| `undefined`

#### Returns

[`PatrolEvent`](../../types/interfaces/PatrolEvent.md) \| `undefined`

***

### enqueue()

> **enqueue**(`event`): `void`

#### Parameters

##### event

[`PatrolEvent`](../../types/interfaces/PatrolEvent.md)

#### Returns

`void`

***

### getBySeverity()

> **getBySeverity**(`severity`): [`PatrolEvent`](../../types/interfaces/PatrolEvent.md)[]

#### Parameters

##### severity

[`IncidentSeverity`](../../types/type-aliases/IncidentSeverity.md)

#### Returns

[`PatrolEvent`](../../types/interfaces/PatrolEvent.md)[]

***

### getEvents()

> **getEvents**(): [`PatrolEvent`](../../types/interfaces/PatrolEvent.md)[]

#### Returns

[`PatrolEvent`](../../types/interfaces/PatrolEvent.md)[]

***

### peek()

> **peek**(): [`PatrolEvent`](../../types/interfaces/PatrolEvent.md) \| `undefined`

#### Returns

[`PatrolEvent`](../../types/interfaces/PatrolEvent.md) \| `undefined`

***

### size()

> **size**(): `number`

#### Returns

`number`

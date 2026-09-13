[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/neuro/progress-bus](../README.md) / ProgressBus

# Class: ProgressBus

## Constructors

### Constructor

> **new ProgressBus**(): `ProgressBus`

#### Returns

`ProgressBus`

## Methods

### clear()

> **clear**(): `void`

Remove all active subscribers.

#### Returns

`void`

***

### publish()

> **publish**(`event`): `void`

Publish a progress event to all active subscribers.

#### Parameters

##### event

[`AssetProgressEvent`](../interfaces/AssetProgressEvent.md)

#### Returns

`void`

***

### subscribe()

> **subscribe**(`callback`): () => `void`

Subscribe to asset download progress events.
Returns an unsubscribe function.

#### Parameters

##### callback

[`ProgressSubscriber`](../type-aliases/ProgressSubscriber.md)

#### Returns

() => `void`

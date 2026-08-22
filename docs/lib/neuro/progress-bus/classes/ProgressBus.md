[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/neuro/progress-bus](../README.md) / ProgressBus

# Class: ProgressBus

Defined in: [lib/neuro/progress-bus.ts:17](https://github.com/fderuiter/portfolio/blob/main/lib/neuro/progress-bus.ts#L17)

## Constructors

### Constructor

> **new ProgressBus**(): `ProgressBus`

#### Returns

`ProgressBus`

## Methods

### clear()

> **clear**(): `void`

Defined in: [lib/neuro/progress-bus.ts:47](https://github.com/fderuiter/portfolio/blob/main/lib/neuro/progress-bus.ts#L47)

Remove all active subscribers.

#### Returns

`void`

***

### publish()

> **publish**(`event`): `void`

Defined in: [lib/neuro/progress-bus.ts:34](https://github.com/fderuiter/portfolio/blob/main/lib/neuro/progress-bus.ts#L34)

Publish a progress event to all active subscribers.

#### Parameters

##### event

[`AssetProgressEvent`](../interfaces/AssetProgressEvent.md)

#### Returns

`void`

***

### subscribe()

> **subscribe**(`callback`): () => `void`

Defined in: [lib/neuro/progress-bus.ts:24](https://github.com/fderuiter/portfolio/blob/main/lib/neuro/progress-bus.ts#L24)

Subscribe to asset download progress events.
Returns an unsubscribe function.

#### Parameters

##### callback

[`ProgressSubscriber`](../type-aliases/ProgressSubscriber.md)

#### Returns

() => `void`

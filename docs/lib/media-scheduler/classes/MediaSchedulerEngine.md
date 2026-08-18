[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/media-scheduler](../README.md) / MediaSchedulerEngine

# Class: MediaSchedulerEngine

Defined in: [lib/media-scheduler.ts:120](https://github.com/fderuiter/portfolio/blob/main/lib/media-scheduler.ts#L120)

## Constructors

### Constructor

> **new MediaSchedulerEngine**(): `MediaSchedulerEngine`

Defined in: [lib/media-scheduler.ts:125](https://github.com/fderuiter/portfolio/blob/main/lib/media-scheduler.ts#L125)

#### Returns

`MediaSchedulerEngine`

## Methods

### clearQueue()

> **clearQueue**(): `void`

Defined in: [lib/media-scheduler.ts:322](https://github.com/fderuiter/portfolio/blob/main/lib/media-scheduler.ts#L322)

#### Returns

`void`

***

### getQueueSnapshot()

> **getQueueSnapshot**(): `object`

Defined in: [lib/media-scheduler.ts:305](https://github.com/fderuiter/portfolio/blob/main/lib/media-scheduler.ts#L305)

#### Returns

`object`

##### activeCount

> **activeCount**: `number`

##### queuedCount

> **queuedCount**: `number`

##### tasks

> **tasks**: `object`[]

***

### processQueue()

> **processQueue**(): `void`

Defined in: [lib/media-scheduler.ts:232](https://github.com/fderuiter/portfolio/blob/main/lib/media-scheduler.ts#L232)

Evaluates pending tasks and processes eligible downloads.

#### Returns

`void`

***

### schedule()

> **schedule**\<`T`\>(`id`, `loadFn`, `options?`): `Promise`\<`T`\>

Defined in: [lib/media-scheduler.ts:154](https://github.com/fderuiter/portfolio/blob/main/lib/media-scheduler.ts#L154)

Schedules a media asset download task.

#### Type Parameters

##### T

`T`

#### Parameters

##### id

`string`

##### loadFn

() => `Promise`\<`T`\>

##### options?

[`ScheduledMediaOptions`](../interfaces/ScheduledMediaOptions.md) = `{}`

#### Returns

`Promise`\<`T`\>

***

### subscribe()

> **subscribe**(`callback`): () => `void`

Defined in: [lib/media-scheduler.ts:136](https://github.com/fderuiter/portfolio/blob/main/lib/media-scheduler.ts#L136)

#### Parameters

##### callback

() => `void`

#### Returns

() => `void`

***

### updateTaskProximity()

> **updateTaskProximity**(`id`, `isNearViewport`): `void`

Defined in: [lib/media-scheduler.ts:207](https://github.com/fderuiter/portfolio/blob/main/lib/media-scheduler.ts#L207)

Updates task parameters (e.g. when element enters viewport proximity).

#### Parameters

##### id

`string`

##### isNearViewport

`boolean`

#### Returns

`void`

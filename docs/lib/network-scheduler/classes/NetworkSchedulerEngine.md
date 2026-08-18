[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/network-scheduler](../README.md) / NetworkSchedulerEngine

# Class: NetworkSchedulerEngine

Defined in: [lib/network-scheduler.ts:232](https://github.com/fderuiter/portfolio/blob/main/lib/network-scheduler.ts#L232)

Network Scheduler Core Engine Class

## Constructors

### Constructor

> **new NetworkSchedulerEngine**(): `NetworkSchedulerEngine`

Defined in: [lib/network-scheduler.ts:238](https://github.com/fderuiter/portfolio/blob/main/lib/network-scheduler.ts#L238)

#### Returns

`NetworkSchedulerEngine`

## Methods

### cancelTask()

> **cancelTask**(`id`): `void`

Defined in: [lib/network-scheduler.ts:277](https://github.com/fderuiter/portfolio/blob/main/lib/network-scheduler.ts#L277)

#### Parameters

##### id

`string`

#### Returns

`void`

***

### clearAll()

> **clearAll**(): `void`

Defined in: [lib/network-scheduler.ts:374](https://github.com/fderuiter/portfolio/blob/main/lib/network-scheduler.ts#L374)

#### Returns

`void`

***

### getTaskStatus()

> **getTaskStatus**(`id`): [`TaskStatus`](../type-aliases/TaskStatus.md) \| `undefined`

Defined in: [lib/network-scheduler.ts:285](https://github.com/fderuiter/portfolio/blob/main/lib/network-scheduler.ts#L285)

#### Parameters

##### id

`string`

#### Returns

[`TaskStatus`](../type-aliases/TaskStatus.md) \| `undefined`

***

### processQueue()

> **processQueue**(): `void`

Defined in: [lib/network-scheduler.ts:289](https://github.com/fderuiter/portfolio/blob/main/lib/network-scheduler.ts#L289)

#### Returns

`void`

***

### scheduleTask()

> **scheduleTask**\<`T`\>(`options`): () => `void`

Defined in: [lib/network-scheduler.ts:244](https://github.com/fderuiter/portfolio/blob/main/lib/network-scheduler.ts#L244)

#### Type Parameters

##### T

`T`

#### Parameters

##### options

[`TaskOptions`](../interfaces/TaskOptions.md)\<`T`\>

#### Returns

() => `void`

***

### updateTaskProximity()

> **updateTaskProximity**(`id`, `inProximity`): `void`

Defined in: [lib/network-scheduler.ts:267](https://github.com/fderuiter/portfolio/blob/main/lib/network-scheduler.ts#L267)

#### Parameters

##### id

`string`

##### inProximity

`boolean`

#### Returns

`void`

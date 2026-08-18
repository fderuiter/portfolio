[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useOfflineQueue](../README.md) / useOfflineQueue

# Function: useOfflineQueue()

> **useOfflineQueue**(`options?`): `object`

Defined in: [hooks/useOfflineQueue.ts:342](https://github.com/fderuiter/portfolio/blob/main/hooks/useOfflineQueue.ts#L342)

Custom hook providing access to the persistent offline request queue and online status.
Uses useSyncExternalStore for hydration-safe, referentially stable, cross-tab synchronized state.

## Parameters

### options?

[`UseOfflineQueueOptions`](../interfaces/UseOfflineQueueOptions.md)

Optional hook configuration options.

## Returns

`object`

### clear

> **clear**: () => `void`

#### Returns

`void`

### dequeue

> **dequeue**: (`id`) => `void`

#### Parameters

##### id

`string`

#### Returns

`void`

### enqueue

> **enqueue**: \<`T`\>(`request`) => [`QueuedRequest`](../interfaces/QueuedRequest.md)\<`T`\>

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### request

`Omit`\<[`QueuedRequest`](../interfaces/QueuedRequest.md)\<`T`\>, `"id"` \| `"createdAt"` \| `"retries"`\> & `object`

#### Returns

[`QueuedRequest`](../interfaces/QueuedRequest.md)\<`T`\>

### flush

> **flush**: () => `Promise`\<\{ `failed`: `number`; `processed`: `number`; \}\>

#### Returns

`Promise`\<\{ `failed`: `number`; `processed`: `number`; \}\>

### isOnline

> **isOnline**: `boolean`

### isProcessing

> **isProcessing**: `boolean` = `isProcessingQueue`

### queue

> **queue**: [`QueuedRequest`](../interfaces/QueuedRequest.md)\<`unknown`\>[]

### queueLength

> **queueLength**: `number` = `queue.length`

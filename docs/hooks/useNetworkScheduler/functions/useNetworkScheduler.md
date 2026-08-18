[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useNetworkScheduler](../README.md) / useNetworkScheduler

# Function: useNetworkScheduler()

> **useNetworkScheduler**(): `object`

Defined in: [hooks/useNetworkScheduler.ts:37](https://github.com/fderuiter/portfolio/blob/main/hooks/useNetworkScheduler.ts#L37)

React Hook for connection state and task scheduling

## Returns

### cancelIdle

> **cancelIdle**: (`handle`) => `void` = `cancelMainThreadIdle`

#### Parameters

##### handle

`number`

#### Returns

`void`

### cancelTask

> **cancelTask**: (`id`) => `void`

#### Parameters

##### id

`string`

#### Returns

`void`

### connection

> **connection**: [`ConnectionInfo`](../../../lib/network-scheduler/interfaces/ConnectionInfo.md)

### isSlowConnection

> **isSlowConnection**: `boolean`

### requestIdle

> **requestIdle**: (`callback`, `timeoutMs`) => `number` = `requestMainThreadIdle`

Main Thread Idle Callback Wrapper with Polyfill Fallback

#### Parameters

##### callback

() => `void`

##### timeoutMs?

`number` = `2000`

#### Returns

`number`

### scheduleTask

> **scheduleTask**: \<`T`\>(`options`) => () => `void`

#### Type Parameters

##### T

`T`

#### Parameters

##### options

[`TaskOptions`](../../../lib/network-scheduler/interfaces/TaskOptions.md)\<`T`\>

#### Returns

() => `void`

### updateProximity

> **updateProximity**: (`id`, `inProximity`) => `void`

#### Parameters

##### id

`string`

##### inProximity

`boolean`

#### Returns

`void`

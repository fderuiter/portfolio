[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useNetworkScheduler](../README.md) / useViewportScheduler

# Function: useViewportScheduler()

> **useViewportScheduler**\<`T`\>(`loadTask`, `options`): `object`

Defined in: [hooks/useNetworkScheduler.ts:79](https://github.com/fderuiter/portfolio/blob/main/hooks/useNetworkScheduler.ts#L79)

React Hook for viewport-driven asset scheduling with connection awareness

## Type Parameters

### T

`T` = `unknown`

## Parameters

### loadTask

() => `T` \| `Promise`\<`T`\>

### options

[`UseViewportSchedulerOptions`](../interfaces/UseViewportSchedulerOptions.md)

## Returns

`object`

### connection

> **connection**: [`ConnectionInfo`](../../../lib/network-scheduler/interfaces/ConnectionInfo.md)

### containerRef

> **containerRef**: `RefObject`\<`HTMLDivElement` \| `null`\>

### data

> **data**: `T` \| `null`

### error

> **error**: `unknown`

### isInViewport

> **isInViewport**: `boolean`

### isSlowConnection

> **isSlowConnection**: `boolean`

### shouldLoad

> **shouldLoad**: `boolean`

### status

> **status**: [`TaskStatus`](../../../lib/network-scheduler/type-aliases/TaskStatus.md)

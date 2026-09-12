[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useOfflineQueue](../README.md) / enqueueOfflineRequest

# Function: enqueueOfflineRequest()

> **enqueueOfflineRequest**\<`T`\>(`request`): [`QueuedRequest`](../interfaces/QueuedRequest.md)\<`T`\>

Enqueue a request to be executed when online.

## Type Parameters

### T

`T` = `unknown`

## Parameters

### request

`Omit`\<[`QueuedRequest`](../interfaces/QueuedRequest.md)\<`T`\>, `"id"` \| `"createdAt"` \| `"retries"`\> & `object`

Request configuration excluding auto-generated metadata.

## Returns

[`QueuedRequest`](../interfaces/QueuedRequest.md)\<`T`\>

Complete QueuedRequest object with assigned ID.

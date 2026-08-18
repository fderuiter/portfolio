[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useOfflineQueue](../README.md) / flushOfflineQueue

# Function: flushOfflineQueue()

> **flushOfflineQueue**(): `Promise`\<\{ `failed`: `number`; `processed`: `number`; \}\>

Defined in: [hooks/useOfflineQueue.ts:207](https://github.com/fderuiter/portfolio/blob/main/hooks/useOfflineQueue.ts#L207)

Process queued requests sequentially with exponential backoff retries.

## Returns

`Promise`\<\{ `failed`: `number`; `processed`: `number`; \}\>

Object summarizing processed and failed items count.

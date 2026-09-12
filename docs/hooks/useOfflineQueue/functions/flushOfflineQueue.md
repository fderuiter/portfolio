[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useOfflineQueue](../README.md) / flushOfflineQueue

# Function: flushOfflineQueue()

> **flushOfflineQueue**(): `Promise`\<\{ `failed`: `number`; `processed`: `number`; \}\>

Process queued requests sequentially with exponential backoff retries.

## Returns

`Promise`\<\{ `failed`: `number`; `processed`: `number`; \}\>

Object summarizing processed and failed items count.

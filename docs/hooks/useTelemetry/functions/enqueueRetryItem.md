[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useTelemetry](../README.md) / enqueueRetryItem

# Function: enqueueRetryItem()

> **enqueueRetryItem**(`item`): `void`

Defined in: [hooks/useTelemetry.ts:243](https://github.com/fderuiter/portfolio/blob/main/hooks/useTelemetry.ts#L243)

Enqueue a telemetry retry item using synchronous FIFO eviction when capacity is reached.

## Parameters

### item

[`QueuedEvent`](../interfaces/QueuedEvent.md)

The telemetry event item to enqueue.

## Returns

`void`

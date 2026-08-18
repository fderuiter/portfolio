[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useTelemetry](../README.md) / setQueueCapacity

# Function: setQueueCapacity()

> **setQueueCapacity**(`capacity`): `void`

Defined in: [hooks/useTelemetry.ts:180](https://github.com/fderuiter/portfolio/blob/main/hooks/useTelemetry.ts#L180)

Configure the maximum capacity of the in-memory telemetry retry queue.
Trims existing queue entries from the front (oldest first) if current length exceeds new capacity.

## Parameters

### capacity

`number`

Maximum number of queued items permitted.

## Returns

`void`

[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useTelemetry](../README.md) / scheduleIdleTask

# Function: scheduleIdleTask()

> **scheduleIdleTask**(`task`, `timeout?`): () => `void`

Defined in: [hooks/useTelemetry.ts:75](https://github.com/fderuiter/portfolio/blob/main/hooks/useTelemetry.ts#L75)

Schedule a task during browser idle periods with a fallback timeout mechanism.

## Parameters

### task

() => `void`

The callback task to execute during idle time.

### timeout?

`number` = `2000`

Maximum timeout delay before forcing task execution.

## Returns

Cancellation function.

() => `void`

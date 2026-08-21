[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useTelemetry](../README.md) / scheduleIdleTask

# Function: scheduleIdleTask()

> **scheduleIdleTask**(`task`, `timeout?`): () => `void`

Defined in: [hooks/useTelemetry.ts:211](https://github.com/fderuiter/portfolio/blob/main/hooks/useTelemetry.ts#L211)

Schedules a task during browser idle periods with a fallback timeout.

## Parameters

### task

() => `void`

Callback task to execute.

### timeout?

`number` = `2000`

Maximum timeout delay before forced execution.

## Returns

Cancellation function.

() => `void`

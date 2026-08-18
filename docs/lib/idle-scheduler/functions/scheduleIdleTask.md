[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/idle-scheduler](../README.md) / scheduleIdleTask

# Function: scheduleIdleTask()

> **scheduleIdleTask**(`callback`, `options?`): () => `void`

Defined in: [lib/idle-scheduler.ts:23](https://github.com/fderuiter/portfolio/blob/main/lib/idle-scheduler.ts#L23)

Schedule a task during browser idle frames.

## Parameters

### callback

[`IdleTaskCallback`](../type-aliases/IdleTaskCallback.md)

Task execution callback function.

### options?

[`IdleTaskOptions`](../interfaces/IdleTaskOptions.md) = `...`

Optional configuration including timeout deadline.

## Returns

Cancellation function.

() => `void`

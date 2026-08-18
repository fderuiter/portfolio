[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/idle-scheduler](../README.md) / IdleTaskCallback

# Type Alias: IdleTaskCallback

> **IdleTaskCallback** = (`deadline?`) => `void`

Defined in: [lib/idle-scheduler.ts:7](https://github.com/fderuiter/portfolio/blob/main/lib/idle-scheduler.ts#L7)

Browser Idle Task Scheduler Utility
Schedules non-critical computational tasks during browser idle periods
using requestIdleCallback with setTimeout fallback for seamless cross-browser support.

## Parameters

### deadline?

#### didTimeout

`boolean`

#### timeRemaining

() => `number`

## Returns

`void`

[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useTelemetry](../README.md) / useTelemetry

# Function: useTelemetry()

> **useTelemetry**(`options?`): `object`

Defined in: [hooks/useTelemetry.ts:289](https://github.com/fderuiter/portfolio/blob/main/hooks/useTelemetry.ts#L289)

Custom hook implementing a robust Stale-While-Revalidate (SWR) telemetry system with useSyncExternalStore.
Hydrates state instantly from LocalStorage cache to prevent Cumulative Layout Shifts (CLS),
schedules background syncs, and supports optimistic updates with automated retry queuing and FIFO eviction.

## Parameters

### options?

[`UseTelemetryOptions`](../interfaces/UseTelemetryOptions.md)

Optional configuration options including maximum retry queue capacity.

## Returns

### queueCapacity

> **queueCapacity**: `number`

### queueLength

> **queueLength**: `number`

### recordEvent

> **recordEvent**: (`projectSlug`, `eventType`) => `Promise`\<`void`\>

#### Parameters

##### projectSlug

`string`

##### eventType

[`TelemetryEventType`](../type-aliases/TelemetryEventType.md)

#### Returns

`Promise`\<`void`\>

### refetch

> **refetch**: () => `Promise`\<`void`\> = `fetchTelemetryAggregates`

Fetch latest telemetry aggregates from the server.

#### Returns

`Promise`\<`void`\>

### syncFailed

> **syncFailed**: `boolean` = `store.syncFailed`

### telemetry

> **telemetry**: [`TelemetryData`](../type-aliases/TelemetryData.md) = `store.telemetry`

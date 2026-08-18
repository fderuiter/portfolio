[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useTelemetry](../README.md) / useTelemetry

# Function: useTelemetry()

> **useTelemetry**(`options?`): `object`

Defined in: [hooks/useTelemetry.ts:489](https://github.com/fderuiter/portfolio/blob/main/hooks/useTelemetry.ts#L489)

Custom hook implementing a robust Stale-While-Revalidate (SWR) telemetry system with useSyncExternalStore.
Hydrates state instantly from LocalStorage cache to prevent Cumulative Layout Shifts (CLS),
schedules background syncs during idle frames, and supports optimistic updates with automated retry queuing and FIFO eviction.

## Parameters

### options?

[`UseTelemetryOptions`](../interfaces/UseTelemetryOptions.md)

Optional configuration options including maximum retry queue capacity.

## Returns

### pendingDeferredLength

> **pendingDeferredLength**: `number`

### queueCapacity

> **queueCapacity**: `number`

### queueLength

> **queueLength**: `number`

### recordEvent

> **recordEvent**: (`projectSlug`, `eventType`, `options?`) => `Promise`\<`void`\>

#### Parameters

##### projectSlug

`string`

##### eventType

[`TelemetryEventType`](../type-aliases/TelemetryEventType.md)

##### options?

[`RecordEventOptions`](../interfaces/RecordEventOptions.md)

#### Returns

`Promise`\<`void`\>

### refetch

> **refetch**: (`options?`) => `Promise`\<`void`\> = `fetchTelemetryAggregates`

Fetch latest telemetry aggregates from the server.
Reuses active in-flight Promises for concurrent callers and enforces cooldown throttling.

#### Parameters

##### options?

###### force?

`boolean`

#### Returns

`Promise`\<`void`\>

### syncFailed

> **syncFailed**: `boolean` = `store.syncFailed`

### telemetry

> **telemetry**: [`TelemetryData`](../type-aliases/TelemetryData.md) = `store.telemetry`

[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useTelemetry](../README.md) / useTelemetry

# Function: useTelemetry()

> **useTelemetry**(`options?`): `object`

Custom hook implementing a lightweight SWR telemetry system with useSyncExternalStore.
Hydrates state instantly from LocalStorage cache, schedules background syncs during idle frames,
and delegates retry queueing, rate-limiting rollbacks, and keepalive beacons to TelemetryOutbox.

## Parameters

### options?

[`UseTelemetryOptions`](../interfaces/UseTelemetryOptions.md)

Optional configuration options including maximum retry queue capacity.

## Returns

`object`

### pendingDeferredLength

> **pendingDeferredLength**: `number` = `pendingDeferred.length`

### queueCapacity

> **queueCapacity**: `number`

### queueLength

> **queueLength**: `number` = `telemetryOutbox.size`

### recordEvent

> **recordEvent**: (`projectSlug`, `eventType`, `opts?`) => `Promise`\<`void`\>

#### Parameters

##### projectSlug

`string`

##### eventType

[`TelemetryEventType`](../type-aliases/TelemetryEventType.md)

##### opts?

[`RecordEventOptions`](../interfaces/RecordEventOptions.md)

#### Returns

`Promise`\<`void`\>

### refetch

> **refetch**: (`options?`) => `Promise`\<`void`\> = `fetchTelemetryAggregates`

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

[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useTelemetry](../README.md) / useTelemetry

# Function: useTelemetry()

> **useTelemetry**(): `object`

Defined in: [hooks/useTelemetry.ts:217](https://github.com/fderuiter/portfolio/blob/main/hooks/useTelemetry.ts#L217)

Custom hook implementing a robust Stale-While-Revalidate (SWR) telemetry system with useSyncExternalStore.
Hydrates state instantly from LocalStorage cache to prevent Cumulative Layout Shifts (CLS),
schedules background syncs, and supports optimistic updates with automated rollback and retry queuing.

## Returns

### recordEvent

> **recordEvent**: (`projectSlug`, `eventType`) => `Promise`\<`void`\>

#### Parameters

##### projectSlug

`string`

##### eventType

`"page_view"` \| `"project_click"` \| `"route_error"`

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

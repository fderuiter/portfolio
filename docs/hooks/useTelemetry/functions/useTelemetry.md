[**temp_dir**](../../../README.md)

***

[temp_dir](../../../modules.md) / [hooks/useTelemetry](../README.md) / useTelemetry

# Function: useTelemetry()

> **useTelemetry**(): `object`

Defined in: [hooks/useTelemetry.ts:25](https://github.com/fderuiter/portfolio/blob/main/hooks/useTelemetry.ts#L25)

Custom hook implementing a robust Stale-While-Revalidate (SWR) telemetry system.
Hydrates state instantly from LocalStorage cache to prevent Cumulative Layout Shifts (CLS),
schedules silent background syncs, and supports optimistic layout updates.

## Returns

`object`

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

> **refetch**: () => `Promise`\<`void`\> = `fetchTelemetry`

#### Returns

`Promise`\<`void`\>

### syncFailed

> **syncFailed**: `boolean`

### telemetry

> **telemetry**: [`TelemetryData`](../type-aliases/TelemetryData.md)

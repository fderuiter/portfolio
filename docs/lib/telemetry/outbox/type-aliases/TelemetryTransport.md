[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/telemetry/outbox](../README.md) / TelemetryTransport

# Type Alias: TelemetryTransport

> **TelemetryTransport** = (`item`, `options?`) => `Promise`\<[`TelemetryTransportResponse`](../interfaces/TelemetryTransportResponse.md) \| `Response`\>

Function contract for dispatching telemetry payloads over the network.

## Parameters

### item

[`TelemetryOutboxItem`](../interfaces/TelemetryOutboxItem.md)

### options?

#### keepalive?

`boolean`

## Returns

`Promise`\<[`TelemetryTransportResponse`](../interfaces/TelemetryTransportResponse.md) \| `Response`\>

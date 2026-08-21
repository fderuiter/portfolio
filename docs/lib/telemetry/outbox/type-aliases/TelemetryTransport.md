[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/telemetry/outbox](../README.md) / TelemetryTransport

# Type Alias: TelemetryTransport

> **TelemetryTransport** = (`item`, `options?`) => `Promise`\<[`TelemetryTransportResponse`](../interfaces/TelemetryTransportResponse.md) \| `Response`\>

Defined in: [lib/telemetry/outbox.ts:57](https://github.com/fderuiter/portfolio/blob/main/lib/telemetry/outbox.ts#L57)

Function contract for dispatching telemetry payloads over the network.

## Parameters

### item

[`TelemetryOutboxItem`](../interfaces/TelemetryOutboxItem.md)

### options?

#### keepalive?

`boolean`

## Returns

`Promise`\<[`TelemetryTransportResponse`](../interfaces/TelemetryTransportResponse.md) \| `Response`\>

[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/telemetry/outbox](../README.md) / TelemetryOutboxConfig

# Interface: TelemetryOutboxConfig

Defined in: [lib/telemetry/outbox.ts:74](https://github.com/fderuiter/portfolio/blob/main/lib/telemetry/outbox.ts#L74)

Configuration options for the TelemetryOutbox instance.

## Properties

### autoFlushOnUnload?

> `optional` **autoFlushOnUnload?**: `boolean`

Defined in: [lib/telemetry/outbox.ts:82](https://github.com/fderuiter/portfolio/blob/main/lib/telemetry/outbox.ts#L82)

***

### baseDelayMs?

> `optional` **baseDelayMs?**: `number`

Defined in: [lib/telemetry/outbox.ts:77](https://github.com/fderuiter/portfolio/blob/main/lib/telemetry/outbox.ts#L77)

***

### maxCapacity?

> `optional` **maxCapacity?**: `number`

Defined in: [lib/telemetry/outbox.ts:75](https://github.com/fderuiter/portfolio/blob/main/lib/telemetry/outbox.ts#L75)

***

### maxDelayMs?

> `optional` **maxDelayMs?**: `number`

Defined in: [lib/telemetry/outbox.ts:78](https://github.com/fderuiter/portfolio/blob/main/lib/telemetry/outbox.ts#L78)

***

### maxRetries?

> `optional` **maxRetries?**: `number`

Defined in: [lib/telemetry/outbox.ts:76](https://github.com/fderuiter/portfolio/blob/main/lib/telemetry/outbox.ts#L76)

***

### onRollback?

> `optional` **onRollback?**: (`item`, `reason`, `error?`) => `void`

Defined in: [lib/telemetry/outbox.ts:83](https://github.com/fderuiter/portfolio/blob/main/lib/telemetry/outbox.ts#L83)

#### Parameters

##### item

[`TelemetryOutboxItem`](TelemetryOutboxItem.md)

##### reason

[`RollbackReason`](../type-aliases/RollbackReason.md)

##### error?

`unknown`

#### Returns

`void`

***

### onSuccess?

> `optional` **onSuccess?**: (`item`) => `void`

Defined in: [lib/telemetry/outbox.ts:84](https://github.com/fderuiter/portfolio/blob/main/lib/telemetry/outbox.ts#L84)

#### Parameters

##### item

[`TelemetryOutboxItem`](TelemetryOutboxItem.md)

#### Returns

`void`

***

### storage?

> `optional` **storage?**: [`TelemetryStorage`](TelemetryStorage.md) \| `null`

Defined in: [lib/telemetry/outbox.ts:80](https://github.com/fderuiter/portfolio/blob/main/lib/telemetry/outbox.ts#L80)

***

### storageKey?

> `optional` **storageKey?**: `string`

Defined in: [lib/telemetry/outbox.ts:81](https://github.com/fderuiter/portfolio/blob/main/lib/telemetry/outbox.ts#L81)

***

### transport?

> `optional` **transport?**: [`TelemetryTransport`](../type-aliases/TelemetryTransport.md)

Defined in: [lib/telemetry/outbox.ts:79](https://github.com/fderuiter/portfolio/blob/main/lib/telemetry/outbox.ts#L79)

[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/telemetry/outbox](../README.md) / TelemetryOutboxConfig

# Interface: TelemetryOutboxConfig

Configuration options for the TelemetryOutbox instance.

## Properties

### autoFlushOnUnload?

> `optional` **autoFlushOnUnload?**: `boolean`

***

### baseDelayMs?

> `optional` **baseDelayMs?**: `number`

***

### maxCapacity?

> `optional` **maxCapacity?**: `number`

***

### maxDelayMs?

> `optional` **maxDelayMs?**: `number`

***

### maxRetries?

> `optional` **maxRetries?**: `number`

***

### onRollback?

> `optional` **onRollback?**: (`item`, `reason`, `error?`) => `void`

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

#### Parameters

##### item

[`TelemetryOutboxItem`](TelemetryOutboxItem.md)

#### Returns

`void`

***

### storage?

> `optional` **storage?**: [`TelemetryStorage`](TelemetryStorage.md) \| `null`

***

### storageKey?

> `optional` **storageKey?**: `string`

***

### transport?

> `optional` **transport?**: [`TelemetryTransport`](../type-aliases/TelemetryTransport.md)

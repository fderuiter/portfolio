[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/services/telemetry-service](../README.md) / TelemetryService

# Class: TelemetryService

## Constructors

### Constructor

> **new TelemetryService**(): `TelemetryService`

#### Returns

`TelemetryService`

## Methods

### getAggregateStats()

> `static` **getAggregateStats**(): `Promise`\<`Record`\<`string`, \{ `clicks`: `number`; `views`: `number`; \}\>\>

Fetches aggregate portfolio view/click telemetry statistics.

#### Returns

`Promise`\<`Record`\<`string`, \{ `clicks`: `number`; `views`: `number`; \}\>\>

***

### isRateLimited()

> `static` **isRateLimited**(`req`): `Promise`\<\{ `headers?`: `Record`\<`string`, `string`\>; `limited`: `boolean`; \}\>

Evaluates rate limiting anonymously using Web Crypto SHA-256 IP hashing.

#### Parameters

##### req

`NextRequest`

#### Returns

`Promise`\<\{ `headers?`: `Record`\<`string`, `string`\>; `limited`: `boolean`; \}\>

***

### recordEvent()

> `static` **recordEvent**(`data`): `Promise`\<\{ `buffered`: `boolean`; `event`: [`BufferedTelemetryEvent`](../interfaces/BufferedTelemetryEvent.md); \}\>

Records a telemetry interaction event into the Redis buffer queue.

The Redis buffer is the only store in front of the sync job, so a failed
enqueue drops the event outright. `buffered` reports whether the event was
actually accepted so callers never present a dropped event as durable.

#### Parameters

##### data

[`TelemetryEventInput`](../interfaces/TelemetryEventInput.md)

#### Returns

`Promise`\<\{ `buffered`: `boolean`; `event`: [`BufferedTelemetryEvent`](../interfaces/BufferedTelemetryEvent.md); \}\>

***

### syncBufferedEvents()

> `static` **syncBufferedEvents**(`batchSize`): `Promise`\<\{ `inserted`: `number`; `processed`: `number`; \}\>

Synchronizes buffered telemetry events from Redis into PostgreSQL.
Atomically transfers event batches from 'telemetry_buffer' to 'telemetry_processing'
using LMOVE to guarantee zero telemetry loss during synchronization failures.

#### Parameters

##### batchSize

`number`

#### Returns

`Promise`\<\{ `inserted`: `number`; `processed`: `number`; \}\>

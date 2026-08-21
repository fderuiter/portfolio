[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/services/telemetry-service](../README.md) / TelemetryService

# Class: TelemetryService

Defined in: [lib/services/telemetry-service.ts:69](https://github.com/fderuiter/portfolio/blob/main/lib/services/telemetry-service.ts#L69)

## Constructors

### Constructor

> **new TelemetryService**(): `TelemetryService`

#### Returns

`TelemetryService`

## Methods

### getAggregateStats()

> `static` **getAggregateStats**(): `Promise`\<`Record`\<`string`, \{ `clicks`: `number`; `views`: `number`; \}\>\>

Defined in: [lib/services/telemetry-service.ts:160](https://github.com/fderuiter/portfolio/blob/main/lib/services/telemetry-service.ts#L160)

Fetches aggregate portfolio view/click telemetry statistics.

#### Returns

`Promise`\<`Record`\<`string`, \{ `clicks`: `number`; `views`: `number`; \}\>\>

***

### getQueueDepths()

> `static` **getQueueDepths**(): `Promise`\<\{ `bufferLength`: `number`; `processingLength`: `number`; \}\>

Defined in: [lib/services/telemetry-service.ts:198](https://github.com/fderuiter/portfolio/blob/main/lib/services/telemetry-service.ts#L198)

Pre-flight inspection check that inspects queue depths for both the primary telemetry
buffer queue and the recovery staging queue without modifying, locking, or clearing queued items.

#### Returns

`Promise`\<\{ `bufferLength`: `number`; `processingLength`: `number`; \}\>

***

### isRateLimited()

> `static` **isRateLimited**(`req`): `Promise`\<\{ `headers?`: `Record`\<`string`, `string`\>; `limited`: `boolean`; \}\>

Defined in: [lib/services/telemetry-service.ts:73](https://github.com/fderuiter/portfolio/blob/main/lib/services/telemetry-service.ts#L73)

Evaluates rate limiting anonymously using Web Crypto SHA-256 IP hashing.

#### Parameters

##### req

`NextRequest`

#### Returns

`Promise`\<\{ `headers?`: `Record`\<`string`, `string`\>; `limited`: `boolean`; \}\>

***

### recordEvent()

> `static` **recordEvent**(`data`): `Promise`\<\{ `createdAt`: `Date`; `eventType`: `string`; `id`: `string`; `projectSlug`: `string`; \}\>

Defined in: [lib/services/telemetry-service.ts:136](https://github.com/fderuiter/portfolio/blob/main/lib/services/telemetry-service.ts#L136)

Records a telemetry interaction event into the Redis buffer queue.

#### Parameters

##### data

[`TelemetryEventInput`](../interfaces/TelemetryEventInput.md)

#### Returns

`Promise`\<\{ `createdAt`: `Date`; `eventType`: `string`; `id`: `string`; `projectSlug`: `string`; \}\>

***

### syncBufferedEvents()

> `static` **syncBufferedEvents**(`batchSize`): `Promise`\<\{ `inserted`: `number`; `processed`: `number`; \}\>

Defined in: [lib/services/telemetry-service.ts:228](https://github.com/fderuiter/portfolio/blob/main/lib/services/telemetry-service.ts#L228)

Synchronizes buffered telemetry events from Redis into PostgreSQL.
Runs a pre-flight queue depth check on both 'telemetry_buffer' and 'telemetry_processing'
queues to immediately exit on idle cycles without executing state-mutating cache commands.
Whenever either queue contains events, atomically transfers event batches from
'telemetry_buffer' to 'telemetry_processing' using LMOVE to guarantee zero telemetry loss.

#### Parameters

##### batchSize

`number`

#### Returns

`Promise`\<\{ `inserted`: `number`; `processed`: `number`; \}\>

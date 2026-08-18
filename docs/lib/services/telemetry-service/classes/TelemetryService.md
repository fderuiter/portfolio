[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/services/telemetry-service](../README.md) / TelemetryService

# Class: TelemetryService

Defined in: [lib/services/telemetry-service.ts:77](https://github.com/fderuiter/portfolio/blob/main/lib/services/telemetry-service.ts#L77)

## Constructors

### Constructor

> **new TelemetryService**(): `TelemetryService`

#### Returns

`TelemetryService`

## Methods

### getAggregateStats()

> `static` **getAggregateStats**(): `Promise`\<`Record`\<`string`, \{ `clicks`: `number`; `views`: `number`; \}\>\>

Defined in: [lib/services/telemetry-service.ts:168](https://github.com/fderuiter/portfolio/blob/main/lib/services/telemetry-service.ts#L168)

Fetches aggregate portfolio view/click telemetry statistics.

#### Returns

`Promise`\<`Record`\<`string`, \{ `clicks`: `number`; `views`: `number`; \}\>\>

***

### isRateLimited()

> `static` **isRateLimited**(`req`): `Promise`\<\{ `headers?`: `Record`\<`string`, `string`\>; `limited`: `boolean`; \}\>

Defined in: [lib/services/telemetry-service.ts:81](https://github.com/fderuiter/portfolio/blob/main/lib/services/telemetry-service.ts#L81)

Evaluates rate limiting anonymously using Web Crypto SHA-256 IP hashing.

#### Parameters

##### req

`NextRequest`

#### Returns

`Promise`\<\{ `headers?`: `Record`\<`string`, `string`\>; `limited`: `boolean`; \}\>

***

### recordEvent()

> `static` **recordEvent**(`data`): `Promise`\<\{ `createdAt`: `Date`; `eventType`: `string`; `id`: `string`; `projectSlug`: `string`; \}\>

Defined in: [lib/services/telemetry-service.ts:144](https://github.com/fderuiter/portfolio/blob/main/lib/services/telemetry-service.ts#L144)

Records a telemetry interaction event into the Redis buffer queue.

#### Parameters

##### data

[`TelemetryEventInput`](../interfaces/TelemetryEventInput.md)

#### Returns

`Promise`\<\{ `createdAt`: `Date`; `eventType`: `string`; `id`: `string`; `projectSlug`: `string`; \}\>

***

### syncBufferedEvents()

> `static` **syncBufferedEvents**(`batchSize`): `Promise`\<\{ `inserted`: `number`; `processed`: `number`; \}\>

Defined in: [lib/services/telemetry-service.ts:205](https://github.com/fderuiter/portfolio/blob/main/lib/services/telemetry-service.ts#L205)

Synchronizes buffered telemetry events from Redis into PostgreSQL.

#### Parameters

##### batchSize

`number`

#### Returns

`Promise`\<\{ `inserted`: `number`; `processed`: `number`; \}\>

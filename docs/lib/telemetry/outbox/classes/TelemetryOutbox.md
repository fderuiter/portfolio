[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/telemetry/outbox](../README.md) / TelemetryOutbox

# Class: TelemetryOutbox

Defined in: [lib/telemetry/outbox.ts:109](https://github.com/fderuiter/portfolio/blob/main/lib/telemetry/outbox.ts#L109)

Pure, framework-agnostic telemetry outbox buffer.
Provides FIFO bounded capacity, exponential backoff retries on 5xx/network errors,
targeted rollback on HTTP 429 rate limits, storage serialization, and unload keepalive beacons.

## Constructors

### Constructor

> **new TelemetryOutbox**(`config?`): `TelemetryOutbox`

Defined in: [lib/telemetry/outbox.ts:126](https://github.com/fderuiter/portfolio/blob/main/lib/telemetry/outbox.ts#L126)

#### Parameters

##### config?

[`TelemetryOutboxConfig`](../interfaces/TelemetryOutboxConfig.md)

#### Returns

`TelemetryOutbox`

## Accessors

### isDestroyed

#### Get Signature

> **get** **isDestroyed**(): `boolean`

Defined in: [lib/telemetry/outbox.ts:410](https://github.com/fderuiter/portfolio/blob/main/lib/telemetry/outbox.ts#L410)

Returns true if the outbox instance has been destroyed.

##### Returns

`boolean`

***

### isEmpty

#### Get Signature

> **get** **isEmpty**(): `boolean`

Defined in: [lib/telemetry/outbox.ts:403](https://github.com/fderuiter/portfolio/blob/main/lib/telemetry/outbox.ts#L403)

Returns true if the outbox queue is currently empty.

##### Returns

`boolean`

***

### size

#### Get Signature

> **get** **size**(): `number`

Defined in: [lib/telemetry/outbox.ts:396](https://github.com/fderuiter/portfolio/blob/main/lib/telemetry/outbox.ts#L396)

Gets the current number of queued items.

##### Returns

`number`

## Methods

### clear()

> **clear**(): `void`

Defined in: [lib/telemetry/outbox.ts:431](https://github.com/fderuiter/portfolio/blob/main/lib/telemetry/outbox.ts#L431)

Synchronously clears all items from the queue and storage and cancels any pending retry timer.

#### Returns

`void`

***

### destroy()

> **destroy**(): `void`

Defined in: [lib/telemetry/outbox.ts:443](https://github.com/fderuiter/portfolio/blob/main/lib/telemetry/outbox.ts#L443)

Cleans up all event listeners, cancels pending timers, and destroys the outbox instance.

#### Returns

`void`

***

### enqueue()

> **enqueue**(`item`): `void`

Defined in: [lib/telemetry/outbox.ts:276](https://github.com/fderuiter/portfolio/blob/main/lib/telemetry/outbox.ts#L276)

Enqueues an item directly into the outbox buffer, applying FIFO capacity eviction if needed.

#### Parameters

##### item

[`TelemetryOutboxItem`](../interfaces/TelemetryOutboxItem.md)

Telemetry item to enqueue.

#### Returns

`void`

***

### flush()

> **flush**(`options?`): `Promise`\<`void`\>

Defined in: [lib/telemetry/outbox.ts:297](https://github.com/fderuiter/portfolio/blob/main/lib/telemetry/outbox.ts#L297)

Flushes all queued items immediately through the configured transport.

#### Parameters

##### options?

Optional options such as keepalive beacon flag.

###### keepalive?

`boolean`

#### Returns

`Promise`\<`void`\>

***

### getCapacity()

> **getCapacity**(): `number`

Defined in: [lib/telemetry/outbox.ts:389](https://github.com/fderuiter/portfolio/blob/main/lib/telemetry/outbox.ts#L389)

Gets the current maximum queue capacity.

#### Returns

`number`

***

### getQueue()

> **getQueue**(): [`TelemetryOutboxItem`](../interfaces/TelemetryOutboxItem.md)[]

Defined in: [lib/telemetry/outbox.ts:417](https://github.com/fderuiter/portfolio/blob/main/lib/telemetry/outbox.ts#L417)

Returns a shallow copy of the current queue items.

#### Returns

[`TelemetryOutboxItem`](../interfaces/TelemetryOutboxItem.md)[]

***

### peek()

> **peek**(): [`TelemetryOutboxItem`](../interfaces/TelemetryOutboxItem.md) \| `undefined`

Defined in: [lib/telemetry/outbox.ts:424](https://github.com/fderuiter/portfolio/blob/main/lib/telemetry/outbox.ts#L424)

Returns the oldest item at the front of the queue without removing it.

#### Returns

[`TelemetryOutboxItem`](../interfaces/TelemetryOutboxItem.md) \| `undefined`

***

### send()

> **send**(`item`): `Promise`\<`boolean`\>

Defined in: [lib/telemetry/outbox.ts:240](https://github.com/fderuiter/portfolio/blob/main/lib/telemetry/outbox.ts#L240)

Attempts immediate dispatch of a single telemetry item.
If delivery fails with a retryable error, the item is buffered into the outbox.

#### Parameters

##### item

[`TelemetryOutboxItem`](../interfaces/TelemetryOutboxItem.md)

Telemetry item to transmit.

#### Returns

`Promise`\<`boolean`\>

True if successfully dispatched, false otherwise.

***

### setCapacity()

> **setCapacity**(`capacity`): `void`

Defined in: [lib/telemetry/outbox.ts:377](https://github.com/fderuiter/portfolio/blob/main/lib/telemetry/outbox.ts#L377)

Sets a new maximum capacity limit on the queue, trimming oldest entries if needed.

#### Parameters

##### capacity

`number`

New maximum capacity integer.

#### Returns

`void`

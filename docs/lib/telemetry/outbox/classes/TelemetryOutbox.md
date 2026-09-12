[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/telemetry/outbox](../README.md) / TelemetryOutbox

# Class: TelemetryOutbox

Pure, framework-agnostic telemetry outbox buffer.
Provides FIFO bounded capacity, exponential backoff retries on 5xx/network errors,
targeted rollback on HTTP 429 rate limits, storage serialization, and unload keepalive beacons.

## Constructors

### Constructor

> **new TelemetryOutbox**(`config?`): `TelemetryOutbox`

#### Parameters

##### config?

[`TelemetryOutboxConfig`](../interfaces/TelemetryOutboxConfig.md)

#### Returns

`TelemetryOutbox`

## Accessors

### isDestroyed

#### Get Signature

> **get** **isDestroyed**(): `boolean`

Returns true if the outbox instance has been destroyed.

##### Returns

`boolean`

***

### isEmpty

#### Get Signature

> **get** **isEmpty**(): `boolean`

Returns true if the outbox queue is currently empty.

##### Returns

`boolean`

***

### size

#### Get Signature

> **get** **size**(): `number`

Gets the current number of queued items.

##### Returns

`number`

## Methods

### clear()

> **clear**(): `void`

Synchronously clears all items from the queue and storage and cancels any pending retry timer.

#### Returns

`void`

***

### destroy()

> **destroy**(): `void`

Cleans up all event listeners, cancels pending timers, and destroys the outbox instance.

#### Returns

`void`

***

### enqueue()

> **enqueue**(`item`): `void`

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

Gets the current maximum queue capacity.

#### Returns

`number`

***

### getQueue()

> **getQueue**(): [`TelemetryOutboxItem`](../interfaces/TelemetryOutboxItem.md)[]

Returns a shallow copy of the current queue items.

#### Returns

[`TelemetryOutboxItem`](../interfaces/TelemetryOutboxItem.md)[]

***

### peek()

> **peek**(): [`TelemetryOutboxItem`](../interfaces/TelemetryOutboxItem.md) \| `undefined`

Returns the oldest item at the front of the queue without removing it.

#### Returns

[`TelemetryOutboxItem`](../interfaces/TelemetryOutboxItem.md) \| `undefined`

***

### send()

> **send**(`item`): `Promise`\<`boolean`\>

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

Sets a new maximum capacity limit on the queue, trimming oldest entries if needed.

#### Parameters

##### capacity

`number`

New maximum capacity integer.

#### Returns

`void`

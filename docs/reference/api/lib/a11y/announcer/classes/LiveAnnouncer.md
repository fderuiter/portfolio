[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/a11y/announcer](../README.md) / LiveAnnouncer

# Class: LiveAnnouncer

Pure LiveAnnouncer Engine managing polite FIFO queuing, assertive preemption, and auto-expiration timers.

## Constructors

### Constructor

> **new LiveAnnouncer**(`options?`): `LiveAnnouncer`

#### Parameters

##### options?

[`LiveAnnouncerOptions`](../interfaces/LiveAnnouncerOptions.md) = `{}`

#### Returns

`LiveAnnouncer`

## Methods

### announce()

> **announce**(`message`, `priority?`): [`AnnounceItem`](../interfaces/AnnounceItem.md) \| `null`

Enqueues or plays an announcement based on priority and current active state.

#### Parameters

##### message

`string`

Text content to announce to assistive technologies.

##### priority?

[`Priority`](../type-aliases/Priority.md) = `"polite"`

Announcement priority level (polite or assertive).

#### Returns

[`AnnounceItem`](../interfaces/AnnounceItem.md) \| `null`

The generated announcement item or null if invalid.

***

### clear()

> **clear**(): `void`

Clears all active announcements, queued items, and cancels running timers.

#### Returns

`void`

***

### destroy()

> **destroy**(): `void`

Destroys the announcer instance, cancelling timers and removing all subscribers.

#### Returns

`void`

***

### getSnapshot()

> **getSnapshot**(): [`AnnouncerState`](../interfaces/AnnouncerState.md)

Returns the current immutable snapshot of the announcer state.

#### Returns

[`AnnouncerState`](../interfaces/AnnouncerState.md)

***

### subscribe()

> **subscribe**(`listener`): () => `void`

Subscribes a listener callback to state changes.

#### Parameters

##### listener

[`LiveAnnouncerListener`](../type-aliases/LiveAnnouncerListener.md)

Callback function invoked whenever the snapshot transitions.

#### Returns

Unsubscribe function to detach the listener.

() => `void`

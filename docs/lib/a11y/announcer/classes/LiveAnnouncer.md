[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/a11y/announcer](../README.md) / LiveAnnouncer

# Class: LiveAnnouncer

Defined in: [lib/a11y/announcer.ts:69](https://github.com/fderuiter/portfolio/blob/main/lib/a11y/announcer.ts#L69)

Pure LiveAnnouncer Engine managing polite FIFO queuing, assertive preemption, and auto-expiration timers.

## Constructors

### Constructor

> **new LiveAnnouncer**(`options?`): `LiveAnnouncer`

Defined in: [lib/a11y/announcer.ts:76](https://github.com/fderuiter/portfolio/blob/main/lib/a11y/announcer.ts#L76)

#### Parameters

##### options?

[`LiveAnnouncerOptions`](../interfaces/LiveAnnouncerOptions.md) = `{}`

#### Returns

`LiveAnnouncer`

## Methods

### announce()

> **announce**(`message`, `priority?`): [`AnnounceItem`](../interfaces/AnnounceItem.md) \| `null`

Defined in: [lib/a11y/announcer.ts:114](https://github.com/fderuiter/portfolio/blob/main/lib/a11y/announcer.ts#L114)

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

Defined in: [lib/a11y/announcer.ts:164](https://github.com/fderuiter/portfolio/blob/main/lib/a11y/announcer.ts#L164)

Clears all active announcements, queued items, and cancels running timers.

#### Returns

`void`

***

### destroy()

> **destroy**(): `void`

Defined in: [lib/a11y/announcer.ts:178](https://github.com/fderuiter/portfolio/blob/main/lib/a11y/announcer.ts#L178)

Destroys the announcer instance, cancelling timers and removing all subscribers.

#### Returns

`void`

***

### getSnapshot()

> **getSnapshot**(): [`AnnouncerState`](../interfaces/AnnouncerState.md)

Defined in: [lib/a11y/announcer.ts:103](https://github.com/fderuiter/portfolio/blob/main/lib/a11y/announcer.ts#L103)

Returns the current immutable snapshot of the announcer state.

#### Returns

[`AnnouncerState`](../interfaces/AnnouncerState.md)

***

### subscribe()

> **subscribe**(`listener`): () => `void`

Defined in: [lib/a11y/announcer.ts:93](https://github.com/fderuiter/portfolio/blob/main/lib/a11y/announcer.ts#L93)

Subscribes a listener callback to state changes.

#### Parameters

##### listener

[`LiveAnnouncerListener`](../type-aliases/LiveAnnouncerListener.md)

Callback function invoked whenever the snapshot transitions.

#### Returns

Unsubscribe function to detach the listener.

() => `void`

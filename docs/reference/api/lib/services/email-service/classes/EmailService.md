[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/services/email-service](../README.md) / EmailService

# Class: EmailService

Deep module encapsulating all outbound transactional email workflows,
bounce/complaint suppression list defenses, retry queueing, and webhook ingestion.

## Constructors

### Constructor

> **new EmailService**(): `EmailService`

#### Returns

`EmailService`

## Methods

### handleWebhookEvent()

> `static` **handleWebhookEvent**(`event`): `Promise`\<\{ `handled`: `boolean`; `reason?`: `string`; `suppressed?`: `boolean`; \}\>

Processes incoming Resend deliverability webhook event.

`handled: false` signals a durable-processing failure (e.g. the
suppression-list write threw) rather than a no-op event type; callers
must treat that as retryable and must not acknowledge the delivery.

#### Parameters

##### event

###### created_at?

`string` = `...`

###### data

\{\[`key`: `string`\]: `unknown`; `bounce?`: \{ `message?`: `string`; `type?`: `string`; \}; `created_at?`: `string`; `from?`: `string`; `id?`: `string`; `status?`: `string`; `subject?`: `string`; `to?`: `string`[]; \} = `...`

###### data.bounce?

\{ `message?`: `string`; `type?`: `string`; \} = `...`

###### data.bounce.message?

`string` = `...`

###### data.bounce.type?

`string` = `...`

###### data.created_at?

`string` = `...`

###### data.from?

`string` = `...`

###### data.id?

`string` = `...`

###### data.status?

`string` = `...`

###### data.subject?

`string` = `...`

###### data.to?

`string`[] = `...`

###### type

`"email.sent"` \| `"email.delivered"` \| `"email.delivery_delayed"` \| `"email.complained"` \| `"email.bounced"` \| `"email.opened"` \| `"email.clicked"` = `...`

#### Returns

`Promise`\<\{ `handled`: `boolean`; `reason?`: `string`; `suppressed?`: `boolean`; \}\>

***

### isSuppressed()

> `static` **isSuppressed**(`email`): `Promise`\<\{ `reason?`: `string`; `suppressed`: `boolean`; \}\>

Checks if an email address is in the suppression list (bounced, complained, unsubscribed).

#### Parameters

##### email

`string`

#### Returns

`Promise`\<\{ `reason?`: `string`; `suppressed`: `boolean`; \}\>

***

### processRetryQueue()

> `static` **processRetryQueue**(`options?`): `Promise`\<\{ `failed`: `number`; `processed`: `number`; `succeeded`: `number`; \}\>

Processes due items from OutboundEmailQueue with exponential backoff.

#### Parameters

##### options?

###### maxBatchSize?

`number`

###### now?

`Date`

#### Returns

`Promise`\<\{ `failed`: `number`; `processed`: `number`; `succeeded`: `number`; \}\>

***

### queueOutboundEmail()

> `static` **queueOutboundEmail**(`options`, `fromAddress?`, `errorReason?`): `Promise`\<`string` \| `null`\>

Enqueues an email to the persistent OutboundEmailQueue table.

Returns the durable queue id, or `null` when the row could not be
persisted. A null result means the message is not queued and will not be
retried; callers must not present it as accepted for delivery.

#### Parameters

##### options

[`RawEmailOptions`](../interfaces/RawEmailOptions.md)

##### fromAddress?

`string`

##### errorReason?

`string`

#### Returns

`Promise`\<`string` \| `null`\>

***

### recordSuppression()

> `static` **recordSuppression**(`email`, `reason`): `Promise`\<`void`\>

Records an email address in the suppression list.

Deliberately lets a database failure propagate instead of swallowing it:
the caller (`handleWebhookEvent`) depends on this rejecting so it can
report the event as unhandled, which in turn makes the webhook route
respond with a retryable non-2xx status instead of acknowledging a
durable write that never happened. The upsert is idempotent by
construction, so a retried delivery (or a partially-failed batch of
recipients being reprocessed from the start) is always safe to replay.

#### Parameters

##### email

`string`

##### reason

`"BOUNCE"` \| `"COMPLAINT"` \| `"UNSUBSCRIBE"`

#### Returns

`Promise`\<`void`\>

***

### resetClient()

> `static` **resetClient**(): `void`

Resets the cached Resend client instance (primarily used for test isolation).

#### Returns

`void`

***

### sendContactInquiry()

> `static` **sendContactInquiry**(`submission`, `connectionHash?`): `Promise`\<[`ContactDispatchResult`](../interfaces/ContactDispatchResult.md)\>

Dispatches an inbound visitor inquiry:
1. Delivers admin notification to CONTACT_NOTIFICATION_EMAIL
2. Delivers automated confirmation receipt to the visitor

#### Parameters

##### submission

###### _clientTimestamp?

`number` = `...`

###### _gotcha?

`string` = `...`

###### email

`string` = `...`

###### intent

`"general"` \| `"other"` \| `"collaboration"` \| `"consulting"` \| `"recruiting"` = `...`

###### message

`string` = `...`

###### name

`string` = `...`

###### subject

`string` = `...`

##### connectionHash?

`string`

#### Returns

`Promise`\<[`ContactDispatchResult`](../interfaces/ContactDispatchResult.md)\>

***

### sendFeedbackNotification()

> `static` **sendFeedbackNotification**(`payload`): `Promise`\<[`EmailDispatchResult`](../interfaces/EmailDispatchResult.md)\>

Dispatches an alert email to the admin when visitor feedback is submitted on a case study.

#### Parameters

##### payload

[`FeedbackNotificationPayload`](../../../email-templates/interfaces/FeedbackNotificationPayload.md)

#### Returns

`Promise`\<[`EmailDispatchResult`](../interfaces/EmailDispatchResult.md)\>

***

### sendRawEmail()

> `static` **sendRawEmail**(`options`): `Promise`\<[`EmailDispatchResult`](../interfaces/EmailDispatchResult.md)\>

Core dispatcher that transmits an email via Resend SDK or executes simulated delivery.

#### Parameters

##### options

[`RawEmailOptions`](../interfaces/RawEmailOptions.md)

#### Returns

`Promise`\<[`EmailDispatchResult`](../interfaces/EmailDispatchResult.md)\>

***

### subscribeNewsletter()

> `static` **subscribeNewsletter**(`email`, `connectionHash?`): `Promise`\<[`EmailDispatchResult`](../interfaces/EmailDispatchResult.md)\>

Dispatches a newsletter subscription workflow:
1. Delivers welcome confirmation email to the subscriber
2. Alerts admin of the new subscription

#### Parameters

##### email

`string`

##### connectionHash?

`string`

#### Returns

`Promise`\<[`EmailDispatchResult`](../interfaces/EmailDispatchResult.md)\>

[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/services/email-service](../README.md) / EmailService

# Class: EmailService

Defined in: [lib/services/email-service.ts:149](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L149)

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

Defined in: [lib/services/email-service.ts:419](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L419)

Processes incoming Resend deliverability webhook event.

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

Defined in: [lib/services/email-service.ts:160](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L160)

Checks if an email address is in the suppression list (bounced, complained, unsubscribed).

#### Parameters

##### email

`string`

#### Returns

`Promise`\<\{ `reason?`: `string`; `suppressed`: `boolean`; \}\>

***

### processRetryQueue()

> `static` **processRetryQueue**(`options?`): `Promise`\<\{ `failed`: `number`; `processed`: `number`; `succeeded`: `number`; \}\>

Defined in: [lib/services/email-service.ts:239](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L239)

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

> `static` **queueOutboundEmail**(`options`, `fromAddress?`, `errorReason?`): `Promise`\<`string`\>

Defined in: [lib/services/email-service.ts:198](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L198)

Enqueues an email to the persistent OutboundEmailQueue table.

#### Parameters

##### options

[`RawEmailOptions`](../interfaces/RawEmailOptions.md)

##### fromAddress?

`string`

##### errorReason?

`string`

#### Returns

`Promise`\<`string`\>

***

### recordSuppression()

> `static` **recordSuppression**(`email`, `reason`): `Promise`\<`void`\>

Defined in: [lib/services/email-service.ts:180](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L180)

Records an email address in the suppression list.

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

Defined in: [lib/services/email-service.ts:153](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L153)

Resets the cached Resend client instance (primarily used for test isolation).

#### Returns

`void`

***

### sendContactInquiry()

> `static` **sendContactInquiry**(`submission`, `connectionHash?`): `Promise`\<[`ContactDispatchResult`](../interfaces/ContactDispatchResult.md)\>

Defined in: [lib/services/email-service.ts:562](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L562)

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

Defined in: [lib/services/email-service.ts:621](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L621)

Dispatches an alert email to the admin when visitor feedback is submitted on a case study.

#### Parameters

##### payload

[`FeedbackNotificationPayload`](../../../email-templates/interfaces/FeedbackNotificationPayload.md)

#### Returns

`Promise`\<[`EmailDispatchResult`](../interfaces/EmailDispatchResult.md)\>

***

### sendRawEmail()

> `static` **sendRawEmail**(`options`): `Promise`\<[`EmailDispatchResult`](../interfaces/EmailDispatchResult.md)\>

Defined in: [lib/services/email-service.ts:447](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L447)

Core dispatcher that transmits an email via Resend SDK or executes simulated delivery.

#### Parameters

##### options

[`RawEmailOptions`](../interfaces/RawEmailOptions.md)

#### Returns

`Promise`\<[`EmailDispatchResult`](../interfaces/EmailDispatchResult.md)\>

***

### subscribeNewsletter()

> `static` **subscribeNewsletter**(`email`, `connectionHash?`): `Promise`\<[`EmailDispatchResult`](../interfaces/EmailDispatchResult.md)\>

Defined in: [lib/services/email-service.ts:647](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L647)

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

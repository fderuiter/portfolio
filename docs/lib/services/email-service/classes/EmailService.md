[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/services/email-service](../README.md) / EmailService

# Class: EmailService

Defined in: [lib/services/email-service.ts:146](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L146)

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

Defined in: [lib/services/email-service.ts:400](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L400)

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

Defined in: [lib/services/email-service.ts:157](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L157)

Checks if an email address is in the suppression list (bounced, complained, unsubscribed).

#### Parameters

##### email

`string`

#### Returns

`Promise`\<\{ `reason?`: `string`; `suppressed`: `boolean`; \}\>

***

### processRetryQueue()

> `static` **processRetryQueue**(`options?`): `Promise`\<\{ `failed`: `number`; `processed`: `number`; `succeeded`: `number`; \}\>

Defined in: [lib/services/email-service.ts:230](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L230)

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

Defined in: [lib/services/email-service.ts:195](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L195)

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

Defined in: [lib/services/email-service.ts:177](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L177)

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

Defined in: [lib/services/email-service.ts:150](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L150)

Resets the cached Resend client instance (primarily used for test isolation).

#### Returns

`void`

***

### sendContactInquiry()

> `static` **sendContactInquiry**(`submission`, `connectionHash?`): `Promise`\<[`ContactDispatchResult`](../interfaces/ContactDispatchResult.md)\>

Defined in: [lib/services/email-service.ts:527](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L527)

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

Defined in: [lib/services/email-service.ts:583](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L583)

Dispatches an alert email to the admin when visitor feedback is submitted on a case study.

#### Parameters

##### payload

[`FeedbackNotificationPayload`](../../../email-templates/interfaces/FeedbackNotificationPayload.md)

#### Returns

`Promise`\<[`EmailDispatchResult`](../interfaces/EmailDispatchResult.md)\>

***

### sendRawEmail()

> `static` **sendRawEmail**(`options`): `Promise`\<[`EmailDispatchResult`](../interfaces/EmailDispatchResult.md)\>

Defined in: [lib/services/email-service.ts:428](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L428)

Core dispatcher that transmits an email via Resend SDK or executes simulated delivery.

#### Parameters

##### options

[`RawEmailOptions`](../interfaces/RawEmailOptions.md)

#### Returns

`Promise`\<[`EmailDispatchResult`](../interfaces/EmailDispatchResult.md)\>

***

### subscribeNewsletter()

> `static` **subscribeNewsletter**(`email`, `connectionHash?`): `Promise`\<[`EmailDispatchResult`](../interfaces/EmailDispatchResult.md)\>

Defined in: [lib/services/email-service.ts:606](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L606)

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

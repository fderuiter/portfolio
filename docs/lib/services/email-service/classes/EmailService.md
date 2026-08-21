[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/services/email-service](../README.md) / EmailService

# Class: EmailService

Defined in: [lib/services/email-service.ts:119](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L119)

Deep module encapsulating all outbound transactional email workflows,
bounce/complaint suppression list defenses, and webhook ingestion.

## Constructors

### Constructor

> **new EmailService**(): `EmailService`

#### Returns

`EmailService`

## Methods

### handleWebhookEvent()

> `static` **handleWebhookEvent**(`event`): `Promise`\<\{ `handled`: `boolean`; `reason?`: `string`; `suppressed?`: `boolean`; \}\>

Defined in: [lib/services/email-service.ts:168](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L168)

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

Defined in: [lib/services/email-service.ts:130](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L130)

Checks if an email address is in the suppression list (bounced, complained, unsubscribed).

#### Parameters

##### email

`string`

#### Returns

`Promise`\<\{ `reason?`: `string`; `suppressed`: `boolean`; \}\>

***

### recordSuppression()

> `static` **recordSuppression**(`email`, `reason`): `Promise`\<`void`\>

Defined in: [lib/services/email-service.ts:150](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L150)

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

Defined in: [lib/services/email-service.ts:123](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L123)

Resets the cached Resend client instance (primarily used for test isolation).

#### Returns

`void`

***

### sendContactInquiry()

> `static` **sendContactInquiry**(`submission`, `connectionHash?`): `Promise`\<[`ContactDispatchResult`](../interfaces/ContactDispatchResult.md)\>

Defined in: [lib/services/email-service.ts:270](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L270)

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

Defined in: [lib/services/email-service.ts:326](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L326)

Dispatches an alert email to the admin when visitor feedback is submitted on a case study.

#### Parameters

##### payload

[`FeedbackNotificationPayload`](../../../email-templates/interfaces/FeedbackNotificationPayload.md)

#### Returns

`Promise`\<[`EmailDispatchResult`](../interfaces/EmailDispatchResult.md)\>

***

### sendRawEmail()

> `static` **sendRawEmail**(`options`): `Promise`\<[`EmailDispatchResult`](../interfaces/EmailDispatchResult.md)\>

Defined in: [lib/services/email-service.ts:196](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L196)

Core dispatcher that transmits an email via Resend SDK or executes simulated delivery.

#### Parameters

##### options

[`RawEmailOptions`](../interfaces/RawEmailOptions.md)

#### Returns

`Promise`\<[`EmailDispatchResult`](../interfaces/EmailDispatchResult.md)\>

***

### subscribeNewsletter()

> `static` **subscribeNewsletter**(`email`, `connectionHash?`): `Promise`\<[`EmailDispatchResult`](../interfaces/EmailDispatchResult.md)\>

Defined in: [lib/services/email-service.ts:349](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L349)

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

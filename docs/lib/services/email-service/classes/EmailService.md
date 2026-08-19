[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/services/email-service](../README.md) / EmailService

# Class: EmailService

Defined in: [lib/services/email-service.ts:54](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L54)

Deep module encapsulating all outbound transactional email workflows.
Provides resilient hybrid fallback with simulation mode during development,
CI testing, or when Resend API credentials are not provisioned.

## Constructors

### Constructor

> **new EmailService**(): `EmailService`

#### Returns

`EmailService`

## Methods

### resetClient()

> `static` **resetClient**(): `void`

Defined in: [lib/services/email-service.ts:58](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L58)

Resets the cached Resend client instance (primarily used for test isolation).

#### Returns

`void`

***

### sendContactInquiry()

> `static` **sendContactInquiry**(`submission`, `connectionHash?`): `Promise`\<[`ContactDispatchResult`](../interfaces/ContactDispatchResult.md)\>

Defined in: [lib/services/email-service.ts:126](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L126)

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

`"other"` \| `"general"` \| `"collaboration"` \| `"consulting"` \| `"recruiting"` = `...`

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

Defined in: [lib/services/email-service.ts:182](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L182)

Dispatches an alert email to the admin when visitor feedback is submitted on a case study.

#### Parameters

##### payload

[`FeedbackNotificationPayload`](../../../email-templates/interfaces/FeedbackNotificationPayload.md)

#### Returns

`Promise`\<[`EmailDispatchResult`](../interfaces/EmailDispatchResult.md)\>

***

### sendRawEmail()

> `static` **sendRawEmail**(`options`): `Promise`\<[`EmailDispatchResult`](../interfaces/EmailDispatchResult.md)\>

Defined in: [lib/services/email-service.ts:65](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L65)

Core dispatcher that transmits an email via Resend SDK or executes simulated delivery.

#### Parameters

##### options

[`RawEmailOptions`](../interfaces/RawEmailOptions.md)

#### Returns

`Promise`\<[`EmailDispatchResult`](../interfaces/EmailDispatchResult.md)\>

***

### subscribeNewsletter()

> `static` **subscribeNewsletter**(`email`, `connectionHash?`): `Promise`\<[`EmailDispatchResult`](../interfaces/EmailDispatchResult.md)\>

Defined in: [lib/services/email-service.ts:205](https://github.com/fderuiter/portfolio/blob/main/lib/services/email-service.ts#L205)

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

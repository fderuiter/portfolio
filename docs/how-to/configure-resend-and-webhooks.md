# How-To: Configure Resend and Webhooks

Goal: get transactional email (contact form replies, newsletter
confirmations, case-study feedback alerts) and the inbound Resend
deliverability webhook working locally or in a new deployment environment.
See [ADR 0018](../../adr/0018-resilient-transactional-email-and-bot-defense.md)
and [ADR 0024](../../adr/0024-resilient-resend-webhook-deliverability-and-outbound-retry-queue.md)
for the design rationale behind the retry queue and bounce/complaint
handling this configuration enables. See the
[integration catalog](../reference/integrations-catalog.md) for how Resend
fits alongside this project's other external integrations, and
[how-to: configure Clerk, Sentry, Upstash, Vercel Cron/Analytics, and GitHub data fetching](configure-integrations.md)
for the rest of them.

## 1. Set the required environment variables

These three keys are declared in [`lib/env.ts`](../../lib/env.ts) and
mirrored in `.env.example`:

```bash
RESEND_API_KEY=""
RESEND_WEBHOOK_SECRET="whsec_example_secret_key"
RESEND_FROM_EMAIL="Your Name <notifications@yourdomain.com>"
```

- **`RESEND_API_KEY`**: from the [Resend dashboard](https://resend.com/api-keys).
  Without it, `EmailService` runs in a simulated (non-transmitting) mode —
  useful for local development without spending real sends, but you won't
  receive anything.
- **`RESEND_FROM_EMAIL`**: must be a verified sending address/domain in
  your Resend account, or sends will be rejected.
- **`RESEND_WEBHOOK_SECRET`**: the signing secret Resend gives you when you
  create a webhook endpoint (see step 3). It's a Svix signing secret
  (`whsec_...`), not a Resend API key.

Validate the file against the declared contract:

```bash
npm run env:check
```

## 2. Understand what the webhook receiver does

[`app/api/webhooks/resend/route.ts`](../../app/api/webhooks/resend/route.ts)
receives Resend's deliverability events (bounces, complaints, delivery
confirmations). It:

1. Requires all three Svix signature headers (`svix-id`, `svix-timestamp`,
   `svix-signature`) — a request missing any of them is rejected with 400.
2. Verifies the signature via
   [`verifySvixSignature`](../../lib/services/email-service.ts) against
   `RESEND_WEBHOOK_SECRET` before parsing the body at all — an invalid
   signature is rejected with 401.
3. Parses and validates the JSON payload against `ResendWebhookEventSchema`
   in `lib/schemas.ts` — a payload that doesn't match is rejected with 422.

Because signature verification happens before JSON parsing, a webhook
misconfigured with the wrong secret fails fast and visibly rather than
silently accepting unverified events.

### Event selection

Only `email.bounced` and `email.complained` trigger a suppression-list
write (`EmailService.recordSuppression`). Every other subscribed event type
(`email.sent`, `email.delivered`, `email.delivery_delayed`, `email.opened`,
`email.clicked`) is accepted and acknowledged (`handled: true`) but has no
side effect — there is currently no delivery-analytics store for them.

### Retry and duplicate-delivery semantics

The route acknowledges an event with `200` only once it is durably
processed. If the suppression-list write throws (database outage, connection
drop, etc.), `EmailService.handleWebhookEvent` returns `{ handled: false }`
and the route responds `500` instead of `200` — Resend/Svix treat any non-2xx
response as a delivery failure and retry with backoff, so the event is not
lost.

A legitimate redelivery (Svix retrying after a prior non-2xx, or Resend
sending a genuine duplicate) is never rejected outright — the route does not
attempt to detect "have I seen this `svix-id` before" and short-circuit. Instead,
`recordSuppression` is an idempotent upsert keyed by the recipient's email
address, so replaying the same `email.bounced`/`email.complained` event any
number of times converges on the same suppression-list state rather than
creating duplicate rows or duplicate side effects. This also means a batch
event with multiple recipients is safe to fully retry after a partial
failure: recipients already written are simply re-upserted as a no-op, and
only the recipient that previously failed changes state.

This is a deliberate simplification for this Hobby-tier deployment: it trades
a dedicated processed-event-ID ledger (which would let a duplicate be
detected and skipped without re-touching the database at all) for relying on
upsert idempotency, since a second write to the same suppression row is
already both safe and cheap here.

### Suppression-check failure policy

`EmailService.isSuppressed` (the *read* path, consulted before every
outbound send) fails **open** on a database error — it returns
`{ suppressed: false }` rather than blocking the send. This is intentional:
a transient outage on the read path should not stop all outbound mail. It is
asymmetric with the *write* path above on purpose — a suppression-list write
failure must never be silently accepted, because losing it means a
bounced/complained address could keep receiving mail indefinitely.

### Secret rotation

Only a single active `RESEND_WEBHOOK_SECRET` is supported. There is no
overlap window for verifying against both an old and a new secret during
rotation — rotating the secret in the Resend dashboard and updating the
environment variable must happen together, or verification will fail for
requests signed with whichever secret is not currently configured.

## 3. Register the webhook endpoint with Resend

In the Resend dashboard, add a webhook endpoint pointing at:

```text
https://<your-deployed-domain>/api/webhooks/resend
```

Resend will generate a signing secret for that endpoint — copy it into
`RESEND_WEBHOOK_SECRET`. Locally, you'll need a tunnel (e.g. an `ngrok`-style
forwarding URL) pointing at `npm run dev`'s port if you want to receive real
webhook deliveries against your local environment; otherwise, test the
route directly (see step 4).

## 4. Test the webhook locally without a live tunnel

Because signature verification is a pure function of the raw body and the
three Svix headers, you can construct a valid signed request in a test or a
local script using the same secret your `.env.local` declares, without
needing Resend to actually deliver anything. Follow
[`__tests__/resend-webhook.test.ts`](../../__tests__/resend-webhook.test.ts)
for the exact signing scheme
(`${svixId}.${svixTimestamp}.${payload}`, HMAC over that string) and for
worked examples of both a valid and a tampered signature.

## 5. Confirm the full flow

```bash
npm run dev
```

Submit the contact form (or trigger a newsletter subscription) locally. If
`RESEND_API_KEY` is unset, check the server logs for the simulated-send
confirmation; if it's set, check the Resend dashboard's logs for the real
delivery, and confirm a bounce/complaint against a disposable test address
round-trips through the webhook route without a 400/401/422.

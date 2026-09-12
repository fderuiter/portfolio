[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/schemas](../README.md) / ResendWebhookEventSchema

# Variable: ResendWebhookEventSchema

> `const` **ResendWebhookEventSchema**: `ZodObject`\<\{ `created_at`: `ZodOptional`\<`ZodString`\>; `data`: `ZodObject`\<\{ `bounce`: `ZodOptional`\<`ZodObject`\<\{ `message`: `ZodOptional`\<`ZodString`\>; `type`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>\>; `created_at`: `ZodOptional`\<`ZodString`\>; `from`: `ZodOptional`\<`ZodString`\>; `id`: `ZodOptional`\<`ZodString`\>; `status`: `ZodOptional`\<`ZodString`\>; `subject`: `ZodOptional`\<`ZodString`\>; `to`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; \}, `$loose`\>; `type`: `ZodEnum`\<\{ `email.bounced`: `"email.bounced"`; `email.clicked`: `"email.clicked"`; `email.complained`: `"email.complained"`; `email.delivered`: `"email.delivered"`; `email.delivery_delayed`: `"email.delivery_delayed"`; `email.opened`: `"email.opened"`; `email.sent`: `"email.sent"`; \}\>; \}, `$strip`\>

Schema for Resend Webhook POST payload validation

[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/env](../README.md) / clientEnvSchema

# Variable: clientEnvSchema

> `const` **clientEnvSchema**: `ZodObject`\<\{ `NEXT_PUBLIC_APP_URL`: `ZodUnion`\<\[`ZodOptional`\<`ZodString`\>, `ZodLiteral`\<`""`\>\]\>; `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: `ZodUnion`\<\[`ZodOptional`\<`ZodString`\>, `ZodLiteral`\<`""`\>\]\>; `NEXT_PUBLIC_SENTRY_DSN`: `ZodUnion`\<\[`ZodOptional`\<`ZodString`\>, `ZodLiteral`\<`""`\>\]\>; \}, `$strip`\>

Client-side environment variables schema (prefixed with NEXT_PUBLIC_).
Safe to be bundled and exposed in the browser.

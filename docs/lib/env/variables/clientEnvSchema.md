[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/env](../README.md) / clientEnvSchema

# Variable: clientEnvSchema

> `const` **clientEnvSchema**: `ZodObject`\<\{ `NEXT_PUBLIC_APP_URL`: `ZodDefault`\<`ZodOptional`\<`ZodString`\>\>; `NEXT_PUBLIC_SENTRY_DSN`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>

Defined in: [lib/env.ts:36](https://github.com/fderuiter/portfolio/blob/main/lib/env.ts#L36)

Client-side environment variables schema (prefixed with NEXT_PUBLIC_).
Safe to be bundled and exposed in the browser.

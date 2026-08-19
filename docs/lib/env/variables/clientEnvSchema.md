[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/env](../README.md) / clientEnvSchema

# Variable: clientEnvSchema

> `const` **clientEnvSchema**: `ZodObject`\<\{ `NEXT_PUBLIC_APP_URL`: `ZodOptional`\<`ZodString`\>; `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: `ZodOptional`\<`ZodString`\>; `NEXT_PUBLIC_SENTRY_DSN`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>

Defined in: [lib/env.ts:50](https://github.com/fderuiter/portfolio/blob/main/lib/env.ts#L50)

Client-side environment variables schema (prefixed with NEXT_PUBLIC_).
Safe to be bundled and exposed in the browser.

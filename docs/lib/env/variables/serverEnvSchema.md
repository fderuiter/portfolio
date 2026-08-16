[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/env](../README.md) / serverEnvSchema

# Variable: serverEnvSchema

> `const` **serverEnvSchema**: `ZodObject`\<\{ `CRON_SECRET`: `ZodOptional`\<`ZodString`\>; `DATABASE_URL`: `ZodOptional`\<`ZodString`\>; `DATABASE_URL_UNPOOLED`: `ZodOptional`\<`ZodString`\>; `GITHUB_TOKEN`: `ZodOptional`\<`ZodString`\>; `NODE_ENV`: `ZodDefault`\<`ZodEnum`\<\{ `development`: `"development"`; `production`: `"production"`; `test`: `"test"`; \}\>\>; `PGDATABASE`: `ZodOptional`\<`ZodString`\>; `PGHOST`: `ZodOptional`\<`ZodString`\>; `PGHOST_UNPOOLED`: `ZodOptional`\<`ZodString`\>; `PGPASSWORD`: `ZodOptional`\<`ZodString`\>; `PGUSER`: `ZodOptional`\<`ZodString`\>; `POSTGRES_DATABASE`: `ZodOptional`\<`ZodString`\>; `POSTGRES_HOST`: `ZodOptional`\<`ZodString`\>; `POSTGRES_PASSWORD`: `ZodOptional`\<`ZodString`\>; `POSTGRES_PRISMA_URL`: `ZodOptional`\<`ZodString`\>; `POSTGRES_URL`: `ZodOptional`\<`ZodString`\>; `POSTGRES_URL_NO_SSL`: `ZodOptional`\<`ZodString`\>; `POSTGRES_URL_NON_POOLING`: `ZodOptional`\<`ZodString`\>; `POSTGRES_USER`: `ZodOptional`\<`ZodString`\>; `SENTRY_DSN`: `ZodOptional`\<`ZodString`\>; `UPSTASH_REDIS_REST_TOKEN`: `ZodOptional`\<`ZodString`\>; `UPSTASH_REDIS_REST_URL`: `ZodOptional`\<`ZodString`\>; `VERCEL_ENV`: `ZodOptional`\<`ZodEnum`\<\{ `development`: `"development"`; `preview`: `"preview"`; `production`: `"production"`; \}\>\>; \}, `$strip`\>

Defined in: [lib/env.ts:7](https://github.com/fderuiter/portfolio/blob/main/lib/env.ts#L7)

Server-side environment variables schema.
Secret keys that must never be exposed to the browser.

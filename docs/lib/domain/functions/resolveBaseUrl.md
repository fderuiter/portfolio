[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/domain](../README.md) / resolveBaseUrl

# Function: resolveBaseUrl()

> **resolveBaseUrl**(): `string`

Defined in: [lib/domain.ts:11](https://github.com/fderuiter/portfolio/blob/main/lib/domain.ts#L11)

Centered dynamic helper to synchronously resolve the base URL of the application.
Satisfies the following logic:
1. Checks if a NEXT_PUBLIC_APP_URL environment variable is explicitly configured.
2. If running in a browser environment, safely uses window.location.origin to maintain SSR and browser synchronization.
3. Falls back gracefully to the production canonical domain (https://www.deruiter.dev) in production.
4. Falls back to a local address (http://localhost:3000) in development/preview if omitted.

## Returns

`string`

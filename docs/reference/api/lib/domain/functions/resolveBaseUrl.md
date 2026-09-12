[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/domain](../README.md) / resolveBaseUrl

# Function: resolveBaseUrl()

> **resolveBaseUrl**(): `string`

Centered dynamic helper to synchronously resolve the base URL of the application.
Satisfies the following logic:
1. If running in a browser environment, safely uses window.location.origin to maintain SSR and browser synchronization.
2. In production (VERCEL_ENV="production" or NODE_ENV="production"), defaults strictly to the canonical domain (https://www.deruiter.dev), or uses NEXT_PUBLIC_APP_URL if explicitly configured with a non-localhost domain.
3. In non-production environments, uses NEXT_PUBLIC_APP_URL if provided, or falls back to a local address (http://localhost:3000).

## Returns

`string`

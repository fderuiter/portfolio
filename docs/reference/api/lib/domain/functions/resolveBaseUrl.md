[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/domain](../README.md) / resolveBaseUrl

# Function: resolveBaseUrl()

> **resolveBaseUrl**(): `string`

Centralized helper resolving the canonical base URL of the application.

The value is deterministic and never derived from the runtime browser origin, so
server-rendered markup and client-rendered markup always agree on site identity.
Resolution order:

- In production (VERCEL_ENV="production" or NODE_ENV="production"), returns
  NEXT_PUBLIC_APP_URL when it is explicitly configured with a non-localhost domain,
  otherwise the canonical production domain (https://deruiter.dev).
- In non-production environments, returns NEXT_PUBLIC_APP_URL if provided, or falls
  back to a local address (http://localhost:3000).

Callers that genuinely need the host the visitor is currently on — link sharing, for
example — must use getActiveHostUrl in lib/clipboard.ts instead.

## Returns

`string`

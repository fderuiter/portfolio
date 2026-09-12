[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/security](../README.md) / validateSyncRequest

# Function: validateSyncRequest()

> **validateSyncRequest**(`req`): `object`

Validates the request credentials using the configured environment secret.
- In staging/production (non-development), if the secret is missing, it fails closed (rejects request).
- If the secret is set, it validates the request's Authorization header matching `Bearer <secret>`.
- In local development/test setups, requests are permitted without a secret if none is configured.

## Parameters

### req

`NextRequest`

## Returns

`object`

### errorResponse?

> `optional` **errorResponse?**: `NextResponse`\<`unknown`\>

### isValid

> **isValid**: `boolean`

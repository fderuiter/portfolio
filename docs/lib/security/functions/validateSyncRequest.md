[**temp_dir**](../../../README.md)

***

[temp_dir](../../../modules.md) / [lib/security](../README.md) / validateSyncRequest

# Function: validateSyncRequest()

> **validateSyncRequest**(`req`): `object`

Defined in: [lib/security.ts:24](https://github.com/fderuiter/portfolio/blob/e9125b13b4fd502f929719e363744f8eb92647bc/lib/security.ts#L24)

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

[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/site-governance/greenlight-engine](../README.md) / verifyGreenlightToken

# Function: verifyGreenlightToken()

> **verifyGreenlightToken**(`token`, `secretKey?`): `object`

Defined in: [lib/site-governance/greenlight-engine.ts:246](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/greenlight-engine.ts#L246)

Verifies cryptographic HMAC-SHA256 greenlight token validity and payload integrity.

## Parameters

### token

[`GreenlightTokenPayload`](../../types/interfaces/GreenlightTokenPayload.md)

### secretKey?

`string` = `DEFAULT_HMAC_SECRET`

## Returns

`object`

### reason?

> `optional` **reason?**: `string`

### valid

> **valid**: `boolean`

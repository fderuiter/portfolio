[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/site-governance/greenlight-engine](../README.md) / issueGreenlightToken

# Function: issueGreenlightToken()

> **issueGreenlightToken**(`siteId`, `studyId`, `status`, `facetHash`, `secretKey?`, `expiresInSeconds?`): [`GreenlightTokenPayload`](../../types/interfaces/GreenlightTokenPayload.md)

Defined in: [lib/site-governance/greenlight-engine.ts:164](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/greenlight-engine.ts#L164)

Issues cryptographic HMAC-SHA256 token for site execution greenlight.

## Parameters

### siteId

`string`

### studyId

`string`

### status

[`GreenlightStatus`](../../types/type-aliases/GreenlightStatus.md)

### facetHash

`string`

### secretKey?

`string` = `DEFAULT_HMAC_SECRET`

### expiresInSeconds?

`number` = `86400`

## Returns

[`GreenlightTokenPayload`](../../types/interfaces/GreenlightTokenPayload.md)

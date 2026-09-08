[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/site-governance/greenlight-engine](../README.md) / applySponsorOverride

# Function: applySponsorOverride()

> **applySponsorOverride**(`request`, `previousHash?`, `secretKey?`): [`SponsorOverrideResult`](../../types/interfaces/SponsorOverrideResult.md)

Defined in: [lib/site-governance/greenlight-engine.ts:280](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/greenlight-engine.ts#L280)

Applies dual-signature sponsor override with 21 CFR Part 11 justification audit logging.

## Parameters

### request

[`SponsorOverrideRequest`](../../types/interfaces/SponsorOverrideRequest.md)

### previousHash?

`string` = `"GENESIS_HASH_0000000000000000000000000000000000000000000000000000000000000000"`

### secretKey?

`string` = `DEFAULT_HMAC_SECRET`

## Returns

[`SponsorOverrideResult`](../../types/interfaces/SponsorOverrideResult.md)

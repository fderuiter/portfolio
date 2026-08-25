[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/site-governance/doa-engine](../README.md) / revokePersonnelDelegation

# Function: revokePersonnelDelegation()

> **revokePersonnelDelegation**(`log`, `personnelId`, `piCredentials`, `revocationReason`): [`DOALog`](../../types/interfaces/DOALog.md)

Defined in: [lib/site-governance/doa-engine.ts:155](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/doa-engine.ts#L155)

Revokes a staff task delegation with 21 CFR Part 11 PI signature logging.

## Parameters

### log

[`DOALog`](../../types/interfaces/DOALog.md)

### personnelId

`string`

### piCredentials

#### id

`string`

#### name

`string`

#### passwordHashOrSecret

`string`

### revocationReason

`string`

## Returns

[`DOALog`](../../types/interfaces/DOALog.md)

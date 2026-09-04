[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/site-governance/doa-engine](../README.md) / addPersonnelDelegation

# Function: addPersonnelDelegation()

> **addPersonnelDelegation**(`log`, `personnelData`, `actor`): [`DOALog`](../../types/interfaces/DOALog.md)

Defined in: [lib/site-governance/doa-engine.ts:46](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/doa-engine.ts#L46)

Adds a new personnel task delegation to DOA log.

## Parameters

### log

[`DOALog`](../../types/interfaces/DOALog.md)

### personnelData

`Omit`\<[`DOAPersonnel`](../../types/interfaces/DOAPersonnel.md), `"id"` \| `"status"` \| `"signedByPi"` \| `"revokedByPi"`\>

### actor

#### id

`string`

#### name

`string`

#### role

`string`

## Returns

[`DOALog`](../../types/interfaces/DOALog.md)

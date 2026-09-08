[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/site-governance/doa-engine](../README.md) / signDOALogByPI

# Function: signDOALogByPI()

> **signDOALogByPI**(`log`, `piCredentials`, `justification?`): [`DOALog`](../../types/interfaces/DOALog.md)

Defined in: [lib/site-governance/doa-engine.ts:100](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/doa-engine.ts#L100)

Executes Principal Investigator 21 CFR Part 11 Electronic Signature Sign-off on DOA log.

## Parameters

### log

[`DOALog`](../../types/interfaces/DOALog.md)

### piCredentials

#### id

`string`

#### name

`string`

#### passwordHashOrSecret

`string`

### justification?

`string` = `"Official Principal Investigator sign-off and activation of Delegation of Authority Log"`

## Returns

[`DOALog`](../../types/interfaces/DOALog.md)

[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/site-governance/execution-gatekeeper](../README.md) / verifyExecutionAccess

# Function: verifyExecutionAccess()

> **verifyExecutionAccess**(`params`): [`GatekeeperResult`](../../types/interfaces/GatekeeperResult.md)

Defined in: [lib/site-governance/execution-gatekeeper.ts:22](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/execution-gatekeeper.ts#L22)

Sovereign Site Execution Gatekeeper middleware preventing subject randomization
and eCRF write access on non-greenlight sites.

## Parameters

### params

#### action

[`ExecutionAction`](../../types/type-aliases/ExecutionAction.md)

#### secretKey?

`string`

#### siteId

`string`

#### tokenPayload?

[`GreenlightTokenPayload`](../../types/interfaces/GreenlightTokenPayload.md)

## Returns

[`GatekeeperResult`](../../types/interfaces/GatekeeperResult.md)

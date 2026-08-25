[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/site-governance/execution-gatekeeper](../README.md) / assertExecutionAllowed

# Function: assertExecutionAllowed()

> **assertExecutionAllowed**(`siteId`, `action`, `tokenPayload?`, `secretKey?`): `void`

Defined in: [lib/site-governance/execution-gatekeeper.ts:93](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/execution-gatekeeper.ts#L93)

Asserts that site execution is permitted, throwing SovereignGatekeeperException if blocked.

## Parameters

### siteId

`string`

### action

[`ExecutionAction`](../../types/type-aliases/ExecutionAction.md)

### tokenPayload?

[`GreenlightTokenPayload`](../../types/interfaces/GreenlightTokenPayload.md)

### secretKey?

`string`

## Returns

`void`

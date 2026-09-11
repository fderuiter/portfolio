[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dx/preflight](../README.md) / checkTsxExecution

# Function: checkTsxExecution()

> **checkTsxExecution**(`root`): [`PreflightCheckResult`](../interfaces/PreflightCheckResult.md)

Defined in: [lib/dx/preflight.ts:158](https://github.com/fderuiter/portfolio/blob/main/lib/dx/preflight.ts#L158)

Probes whether this repository's TypeScript scripts can actually
execute in the current environment, using `node --import tsx` -- the
same compatible invocation `package.json`'s own scripts rely on --
rather than `npx tsx`, which can additionally fail on package
resolution/network access in a restricted sandbox even when the
runtime itself is fine. On failure, the message distinguishes a
sandbox/IPC/permission restriction (spawn errors, EPERM/EACCES,
a killed process) from a genuine script error, so an agent doesn't
waste time debugging "product" code for what is actually an
environment restriction it should report and stop escalating past.

## Parameters

### root

`string`

## Returns

[`PreflightCheckResult`](../interfaces/PreflightCheckResult.md)

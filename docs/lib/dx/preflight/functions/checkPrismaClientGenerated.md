[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dx/preflight](../README.md) / checkPrismaClientGenerated

# Function: checkPrismaClientGenerated()

> **checkPrismaClientGenerated**(`root`): [`PreflightCheckResult`](../interfaces/PreflightCheckResult.md)

Defined in: [lib/dx/preflight.ts:131](https://github.com/fderuiter/portfolio/blob/main/lib/dx/preflight.ts#L131)

Verifies the Prisma client has already been generated at
`app/generated/prisma` (this repository's `postinstall` hook runs
`prisma generate` automatically, but a stale checkout, an interrupted
install, or a sandbox that skipped postinstall scripts can leave it
missing -- surfacing as confusing "module not found" errors much later
in `tsc`/tests rather than here, where the real cause is legible).

## Parameters

### root

`string`

## Returns

[`PreflightCheckResult`](../interfaces/PreflightCheckResult.md)

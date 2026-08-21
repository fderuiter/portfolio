[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dx/doctor](../README.md) / checkTestFixtureHygiene

# Function: checkTestFixtureHygiene()

> **checkTestFixtureHygiene**(`root`): [`DiagnosticCheckResult`](../interfaces/DiagnosticCheckResult.md)

Defined in: [lib/dx/doctor.ts:330](https://github.com/fderuiter/portfolio/blob/main/lib/dx/doctor.ts#L330)

Check Test Fixture Hygiene & Unsafe Type Assertions (ADR 0028).
Test suites must use @total-typescript/shoehorn instead of unsafe double casts (`as unknown as [A-Z]`).

## Parameters

### root

`string`

## Returns

[`DiagnosticCheckResult`](../interfaces/DiagnosticCheckResult.md)

[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dx/doctor](../README.md) / runDiagnostics

# Function: runDiagnostics()

> **runDiagnostics**(`options?`): `Promise`\<\{ `hasFailures`: `boolean`; `hasWarnings`: `boolean`; `results`: [`DiagnosticCheckResult`](../interfaces/DiagnosticCheckResult.md)[]; `totalFailed`: `number`; `totalFixed`: `number`; `totalPassed`: `number`; `totalWarned`: `number`; \}\>

Defined in: [lib/dx/doctor.ts:990](https://github.com/fderuiter/portfolio/blob/main/lib/dx/doctor.ts#L990)

Run All Diagnostics

## Parameters

### options?

[`DoctorOptions`](../interfaces/DoctorOptions.md) = `{}`

## Returns

`Promise`\<\{ `hasFailures`: `boolean`; `hasWarnings`: `boolean`; `results`: [`DiagnosticCheckResult`](../interfaces/DiagnosticCheckResult.md)[]; `totalFailed`: `number`; `totalFixed`: `number`; `totalPassed`: `number`; `totalWarned`: `number`; \}\>

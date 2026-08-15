[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/clinical-trial-chaos/engine](../README.md) / verify21CFRSubmission

# Function: verify21CFRSubmission()

> **verify21CFRSubmission**(`subject`, `reason`, `targetStation`): `object`

Defined in: [lib/clinical-trial-chaos/engine.ts:354](https://github.com/fderuiter/portfolio/blob/main/lib/clinical-trial-chaos/engine.ts#L354)

Evaluates 21 CFR Part 11 Electronic Signature submission.

## Parameters

### subject

[`ClinicalSubject`](../../types/interfaces/ClinicalSubject.md)

### reason

`string`

### targetStation

[`CDISCDomain`](../../types/type-aliases/CDISCDomain.md)

## Returns

`object`

### level

> **level**: `"WARN"` \| `"CRITICAL"` \| `"COMPLIANT"`

### logMessage

> **logMessage**: `string`

### success

> **success**: `boolean`

### suspicionDelta

> **suspicionDelta**: `number`

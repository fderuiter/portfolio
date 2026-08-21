[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/study-auditor](../README.md) / StudyAuditReport

# Interface: StudyAuditReport

Defined in: [lib/crf/study-auditor.ts:68](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L68)

Global study audit report returned by StudyAuditor.audit().

## Properties

### autoFix

> **autoFix**: (`diagnosticId`) => [`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

Defined in: [lib/crf/study-auditor.ts:79](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L79)

#### Parameters

##### diagnosticId

`string`

#### Returns

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

***

### autoFixAll

> **autoFixAll**: () => `object`

Defined in: [lib/crf/study-auditor.ts:80](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L80)

#### Returns

`object`

##### fixedCount

> **fixedCount**: `number`

##### protocol

> **protocol**: [`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

***

### diagnostics

> **diagnostics**: [`AuditDiagnostic`](AuditDiagnostic.md)[]

Defined in: [lib/crf/study-auditor.ts:72](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L72)

***

### health

> **health**: [`FormHealthMetrics`](FormHealthMetrics.md)

Defined in: [lib/crf/study-auditor.ts:71](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L71)

***

### isCompliant

> **isCompliant**: `boolean`

Defined in: [lib/crf/study-auditor.ts:69](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L69)

***

### score

> **score**: `number`

Defined in: [lib/crf/study-auditor.ts:70](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L70)

***

### summary

> **summary**: `object`

Defined in: [lib/crf/study-auditor.ts:73](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L73)

#### errors

> **errors**: `number`

#### fixable

> **fixable**: `number`

#### infos

> **infos**: `number`

#### warnings

> **warnings**: `number`

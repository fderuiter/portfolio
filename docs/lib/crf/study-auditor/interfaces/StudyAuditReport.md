[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/study-auditor](../README.md) / StudyAuditReport

# Interface: StudyAuditReport

Defined in: [lib/crf/study-auditor.ts:77](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L77)

Global study audit report returned by StudyAuditor.audit().

## Properties

### autoFix

> **autoFix**: (`diagnosticId`) => [`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

Defined in: [lib/crf/study-auditor.ts:88](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L88)

#### Parameters

##### diagnosticId

`string`

#### Returns

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

***

### autoFixAll

> **autoFixAll**: () => `object`

Defined in: [lib/crf/study-auditor.ts:89](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L89)

#### Returns

`object`

##### fixedCount

> **fixedCount**: `number`

##### protocol

> **protocol**: [`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

***

### diagnostics

> **diagnostics**: [`AuditDiagnostic`](AuditDiagnostic.md)[]

Defined in: [lib/crf/study-auditor.ts:81](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L81)

***

### health

> **health**: [`FormHealthMetrics`](FormHealthMetrics.md)

Defined in: [lib/crf/study-auditor.ts:80](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L80)

***

### isCompliant

> **isCompliant**: `boolean`

Defined in: [lib/crf/study-auditor.ts:78](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L78)

***

### score

> **score**: `number`

Defined in: [lib/crf/study-auditor.ts:79](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L79)

***

### summary

> **summary**: `object`

Defined in: [lib/crf/study-auditor.ts:82](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L82)

#### errors

> **errors**: `number`

#### fixable

> **fixable**: `number`

#### infos

> **infos**: `number`

#### warnings

> **warnings**: `number`

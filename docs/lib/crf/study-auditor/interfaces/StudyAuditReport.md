[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/study-auditor](../README.md) / StudyAuditReport

# Interface: StudyAuditReport

Defined in: [lib/crf/study-auditor.ts:76](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L76)

Global study audit report returned by StudyAuditor.audit().

## Properties

### autoFix

> **autoFix**: (`diagnosticId`) => [`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

Defined in: [lib/crf/study-auditor.ts:87](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L87)

#### Parameters

##### diagnosticId

`string`

#### Returns

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

***

### autoFixAll

> **autoFixAll**: () => `object`

Defined in: [lib/crf/study-auditor.ts:88](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L88)

#### Returns

`object`

##### fixedCount

> **fixedCount**: `number`

##### protocol

> **protocol**: [`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

***

### diagnostics

> **diagnostics**: [`AuditDiagnostic`](AuditDiagnostic.md)[]

Defined in: [lib/crf/study-auditor.ts:80](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L80)

***

### health

> **health**: [`FormHealthMetrics`](FormHealthMetrics.md)

Defined in: [lib/crf/study-auditor.ts:79](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L79)

***

### isCompliant

> **isCompliant**: `boolean`

Defined in: [lib/crf/study-auditor.ts:77](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L77)

***

### score

> **score**: `number`

Defined in: [lib/crf/study-auditor.ts:78](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L78)

***

### summary

> **summary**: `object`

Defined in: [lib/crf/study-auditor.ts:81](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L81)

#### errors

> **errors**: `number`

#### fixable

> **fixable**: `number`

#### infos

> **infos**: `number`

#### warnings

> **warnings**: `number`

[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/study-auditor](../README.md) / StudyAuditor

# Class: StudyAuditor

Defined in: [lib/crf/study-auditor.ts:90](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L90)

Deep domain engine for unified clinical study, form, and formula quality auditing.
Consolidates AST syntax checking, CDISC CDASH 2.2 regulatory compliance,
Schedule of Activities (SoA) consistency, form health telemetry, and 1-click auto-fix remediation.

## Constructors

### Constructor

> **new StudyAuditor**(): `StudyAuditor`

#### Returns

`StudyAuditor`

## Methods

### applyAutoFix()

> `static` **applyAutoFix**(`study`, `diagnosticId`): [`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

Defined in: [lib/crf/study-auditor.ts:395](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L395)

Applies an individual 1-click auto-fix remediation to a StudyProtocol instance.

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### diagnosticId

`string`

#### Returns

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

***

### applyAutoFixAll()

> `static` **applyAutoFixAll**(`study`, `diagnostics?`): `object`

Defined in: [lib/crf/study-auditor.ts:480](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L480)

Applies all available auto-fix remediations in a single pass.

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### diagnostics?

[`AuditDiagnostic`](../interfaces/AuditDiagnostic.md)[]

#### Returns

`object`

##### fixedCount

> **fixedCount**: `number`

##### protocol

> **protocol**: [`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

***

### audit()

> `static` **audit**(`study`): [`StudyAuditReport`](../interfaces/StudyAuditReport.md)

Defined in: [lib/crf/study-auditor.ts:97](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L97)

Performs a comprehensive multi-tier audit across an entire clinical study protocol.

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

The StudyProtocol object to evaluate.

#### Returns

[`StudyAuditReport`](../interfaces/StudyAuditReport.md)

A consolidated StudyAuditReport containing diagnostics, health scores, and auto-fix mutations.

***

### auditForm()

> `static` **auditForm**(`form`, `studyContext?`): [`FormAuditReport`](../interfaces/FormAuditReport.md)

Defined in: [lib/crf/study-auditor.ts:363](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L363)

Audits an individual CRF Form.

#### Parameters

##### form

[`CRFForm`](../../types/interfaces/CRFForm.md)

##### studyContext?

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

#### Returns

[`FormAuditReport`](../interfaces/FormAuditReport.md)

***

### auditFormula()

> `static` **auditFormula**(`formula`, `fields`): [`FormulaLintResult`](../../formula-linter/interfaces/FormulaLintResult.md)

Defined in: [lib/crf/study-auditor.ts:388](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L388)

Evaluates and tokenizes an arithmetic formula expression against a list of fields.

#### Parameters

##### formula

`string`

##### fields

[`CRFField`](../../types/interfaces/CRFField.md)[]

#### Returns

[`FormulaLintResult`](../../formula-linter/interfaces/FormulaLintResult.md)

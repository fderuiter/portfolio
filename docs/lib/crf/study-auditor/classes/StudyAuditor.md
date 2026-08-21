[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/study-auditor](../README.md) / StudyAuditor

# Class: StudyAuditor

Defined in: [lib/crf/study-auditor.ts:667](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L667)

StudyAuditor Deep Domain Facade

## Constructors

### Constructor

> **new StudyAuditor**(): `StudyAuditor`

#### Returns

`StudyAuditor`

## Methods

### audit()

> `static` **audit**(`study`): [`StudyAuditReport`](../interfaces/StudyAuditReport.md)

Defined in: [lib/crf/study-auditor.ts:671](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L671)

Performs an exhaustive multi-dimensional audit of an entire clinical study protocol.

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

#### Returns

[`StudyAuditReport`](../interfaces/StudyAuditReport.md)

***

### auditForm()

> `static` **auditForm**(`form`, `context?`): [`FormAuditSummary`](../interfaces/FormAuditSummary.md)

Defined in: [lib/crf/study-auditor.ts:678](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L678)

Audits an individual CRF form for CDASH conformance, duplicate variables, broken rules, and health telemetry.

#### Parameters

##### form

[`CRFForm`](../../types/interfaces/CRFForm.md)

##### context?

[`FormAuditContext`](../interfaces/FormAuditContext.md)

#### Returns

[`FormAuditSummary`](../interfaces/FormAuditSummary.md)

***

### auditFormula()

> `static` **auditFormula**(`formula`, `fields?`, `currentFieldId?`): [`FormulaAuditSummary`](../interfaces/FormulaAuditSummary.md)

Defined in: [lib/crf/study-auditor.ts:685](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L685)

Static character-accurate AST syntax and clinical validity audit of an arithmetic formula without eval().

#### Parameters

##### formula

`string`

##### fields?

[`CRFField`](../../types/interfaces/CRFField.md)[]

##### currentFieldId?

`string`

#### Returns

[`FormulaAuditSummary`](../interfaces/FormulaAuditSummary.md)

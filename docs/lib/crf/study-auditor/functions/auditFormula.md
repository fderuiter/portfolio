[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/study-auditor](../README.md) / auditFormula

# Function: auditFormula()

> **auditFormula**(`formula`, `fields?`, `currentFieldId?`): [`FormulaAuditSummary`](../interfaces/FormulaAuditSummary.md)

Defined in: [lib/crf/study-auditor.ts:131](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L131)

Pure AST static formula auditing engine without eval() execution.

## Parameters

### formula

`string`

### fields?

[`CRFField`](../../types/interfaces/CRFField.md)[] = `[]`

### currentFieldId?

`string`

## Returns

[`FormulaAuditSummary`](../interfaces/FormulaAuditSummary.md)

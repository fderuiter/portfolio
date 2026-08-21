[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/study-auditor](../README.md) / FormulaAuditSummary

# Interface: FormulaAuditSummary

Defined in: [lib/crf/study-auditor.ts:66](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L66)

## Properties

### diagnostics

> **diagnostics**: [`FormulaDiagnostic`](../../formula-linter/interfaces/FormulaDiagnostic.md)[]

Defined in: [lib/crf/study-auditor.ts:69](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L69)

***

### formula

> **formula**: `string`

Defined in: [lib/crf/study-auditor.ts:67](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L67)

***

### isValid

> **isValid**: `boolean`

Defined in: [lib/crf/study-auditor.ts:68](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L68)

***

### referencedVariables

> **referencedVariables**: `object`[]

Defined in: [lib/crf/study-auditor.ts:72](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L72)

#### exists

> **exists**: `boolean`

#### field?

> `optional` **field?**: [`CRFField`](../../types/interfaces/CRFField.md)

#### isNumeric

> **isNumeric**: `boolean`

#### name

> **name**: `string`

***

### tokens

> **tokens**: [`HighlightToken`](../../formula-linter/interfaces/HighlightToken.md)[]

Defined in: [lib/crf/study-auditor.ts:70](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L70)

***

### unmatchedBracketIndices

> **unmatchedBracketIndices**: `number`[]

Defined in: [lib/crf/study-auditor.ts:71](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L71)

[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/study-auditor](../README.md) / AuditDiagnostic

# Interface: AuditDiagnostic

Defined in: [lib/crf/study-auditor.ts:25](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L25)

Standardized audit diagnostic finding.

## Properties

### autoFixAvailable

> **autoFixAvailable**: `boolean`

Defined in: [lib/crf/study-auditor.ts:36](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L36)

***

### autoFixType?

> `optional` **autoFixType?**: `"truncate_variable"` \| `"add_core_variable"` \| `"assign_nci_codelist"` \| `"fix_date_format"` \| `"assign_visit_form"`

Defined in: [lib/crf/study-auditor.ts:37](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L37)

***

### fieldId?

> `optional` **fieldId?**: `string`

Defined in: [lib/crf/study-auditor.ts:31](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L31)

***

### formId

> **formId**: `string`

Defined in: [lib/crf/study-auditor.ts:29](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L29)

***

### formName?

> `optional` **formName?**: `string`

Defined in: [lib/crf/study-auditor.ts:30](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L30)

***

### id

> **id**: `string`

Defined in: [lib/crf/study-auditor.ts:26](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L26)

***

### message

> **message**: `string`

Defined in: [lib/crf/study-auditor.ts:35](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L35)

***

### ruleDescription?

> `optional` **ruleDescription?**: `string`

Defined in: [lib/crf/study-auditor.ts:34](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L34)

***

### ruleId?

> `optional` **ruleId?**: `string`

Defined in: [lib/crf/study-auditor.ts:33](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L33)

***

### severity

> **severity**: [`DiagnosticSeverity`](../type-aliases/DiagnosticSeverity.md)

Defined in: [lib/crf/study-auditor.ts:28](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L28)

***

### suggestedFix?

> `optional` **suggestedFix?**: `string`

Defined in: [lib/crf/study-auditor.ts:38](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L38)

***

### tier

> **tier**: [`DiagnosticTier`](../type-aliases/DiagnosticTier.md)

Defined in: [lib/crf/study-auditor.ts:27](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L27)

***

### variableName?

> `optional` **variableName?**: `string`

Defined in: [lib/crf/study-auditor.ts:32](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L32)

[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/study-auditor](../README.md) / StudyAuditReport

# Interface: StudyAuditReport

Defined in: [lib/crf/study-auditor.ts:80](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L80)

## Properties

### cdashConformanceScore

> **cdashConformanceScore**: `number`

Defined in: [lib/crf/study-auditor.ts:89](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L89)

***

### findings

> **findings**: [`AuditFinding`](AuditFinding.md)[]

Defined in: [lib/crf/study-auditor.ts:104](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L104)

***

### formAudits

> **formAudits**: `Record`\<`string`, [`FormAuditSummary`](FormAuditSummary.md)\>

Defined in: [lib/crf/study-auditor.ts:107](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L107)

***

### formulaAudits

> **formulaAudits**: `Record`\<`string`, [`FormulaAuditSummary`](FormulaAuditSummary.md)\>

Defined in: [lib/crf/study-auditor.ts:108](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L108)

***

### isValid

> **isValid**: `boolean`

Defined in: [lib/crf/study-auditor.ts:87](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L87)

***

### orphanForms

> **orphanForms**: `object`[]

Defined in: [lib/crf/study-auditor.ts:105](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L105)

#### domain

> **domain**: `string`

#### formId

> **formId**: `string`

#### formName

> **formName**: `string`

***

### orphanVisits

> **orphanVisits**: `object`[]

Defined in: [lib/crf/study-auditor.ts:106](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L106)

#### oid

> **oid**: `string`

#### visitId

> **visitId**: `string`

#### visitName

> **visitName**: `string`

***

### overallScore

> **overallScore**: `number`

Defined in: [lib/crf/study-auditor.ts:88](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L88)

***

### phase?

> `optional` **phase?**: `string`

Defined in: [lib/crf/study-auditor.ts:84](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L84)

***

### protocolNumber

> **protocolNumber**: `string`

Defined in: [lib/crf/study-auditor.ts:82](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L82)

***

### sdvReadinessScore

> **sdvReadinessScore**: `number`

Defined in: [lib/crf/study-auditor.ts:90](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L90)

***

### studyId

> **studyId**: `string`

Defined in: [lib/crf/study-auditor.ts:81](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L81)

***

### studyName

> **studyName**: `string`

Defined in: [lib/crf/study-auditor.ts:83](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L83)

***

### summary

> **summary**: `object`

Defined in: [lib/crf/study-auditor.ts:91](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L91)

#### autoFixableCount

> **autoFixableCount**: `number`

#### errorCount

> **errorCount**: `number`

#### infoCount

> **infoCount**: `number`

#### orphanFormsCount

> **orphanFormsCount**: `number`

#### orphanVisitsCount

> **orphanVisitsCount**: `number`

#### totalFields

> **totalFields**: `number`

#### totalFindings

> **totalFindings**: `number`

#### totalForms

> **totalForms**: `number`

#### totalRules

> **totalRules**: `number`

#### totalVisits

> **totalVisits**: `number`

#### warningCount

> **warningCount**: `number`

***

### therapeuticArea?

> `optional` **therapeuticArea?**: `string`

Defined in: [lib/crf/study-auditor.ts:85](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L85)

***

### timestamp

> **timestamp**: `string`

Defined in: [lib/crf/study-auditor.ts:86](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-auditor.ts#L86)

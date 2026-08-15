[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/cdisc-conformance-linter](../README.md) / validateStudyCompliance

# Function: validateStudyCompliance()

> **validateStudyCompliance**(`study`): [`ComplianceViolation`](../../types/interfaces/ComplianceViolation.md)[]

Defined in: [lib/crf/cdisc-conformance-linter.ts:19](https://github.com/fderuiter/portfolio/blob/main/lib/crf/cdisc-conformance-linter.ts#L19)

Validates an entire study protocol against CDISC CDASH and regulatory submission conformance rules.

## Parameters

### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

The study protocol to validate

## Returns

[`ComplianceViolation`](../../types/interfaces/ComplianceViolation.md)[]

Array of compliance violations found across forms, fields, and visits

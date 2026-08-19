[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/cdisc-conformance-linter](../README.md) / autoFixViolation

# Function: autoFixViolation()

> **autoFixViolation**(`study`, `violation`): [`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

Defined in: [lib/crf/cdisc-conformance-linter.ts:163](https://github.com/fderuiter/portfolio/blob/main/lib/crf/cdisc-conformance-linter.ts#L163)

Applies a single 1-Click Auto-Fix remediation to the study protocol.

## Parameters

### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

The current study protocol

### violation

[`ComplianceViolation`](../../types/interfaces/ComplianceViolation.md)

The compliance violation to remediate

## Returns

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

The updated study protocol with the fix applied

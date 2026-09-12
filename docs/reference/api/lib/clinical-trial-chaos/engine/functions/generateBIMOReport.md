[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/clinical-trial-chaos/engine](../README.md) / generateBIMOReport

# Function: generateBIMOReport()

> **generateBIMOReport**(`scoreState`, `auditorState`, `_logs?`, `ruleViolations?`, `activeProtocol?`): [`BIMOInspectionReport`](../../types/interfaces/BIMOInspectionReport.md)

Generates an FDA Bioresearch Monitoring (BIMO) inspection compliance report.

## Parameters

### scoreState

[`GameScoreState`](../../types/interfaces/GameScoreState.md)

### auditorState

[`AuditorState`](../../types/interfaces/AuditorState.md)

### \_logs?

[`AuditLogEntry`](../../types/interfaces/AuditLogEntry.md)[]

### ruleViolations?

[`RecordedRuleViolation`](../../types/interfaces/RecordedRuleViolation.md)[]

### activeProtocol?

[`StudyProtocol`](../../../crf/types/interfaces/StudyProtocol.md) \| `null`

## Returns

[`BIMOInspectionReport`](../../types/interfaces/BIMOInspectionReport.md)

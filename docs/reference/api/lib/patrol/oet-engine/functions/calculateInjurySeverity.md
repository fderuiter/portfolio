[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/patrol/oet-engine](../README.md) / calculateInjurySeverity

# Function: calculateInjurySeverity()

> **calculateInjurySeverity**(`patient?`, `vitals?`, `environment?`): [`InjurySeverityResult`](../interfaces/InjurySeverityResult.md)

Calculates injury severity score (0-100), level, and physiological factors
based on patient complaint, mechanism of injury, vitals, and environment.

## Parameters

### patient?

`Partial`\<[`PatientState`](../../types/interfaces/PatientState.md)\>

### vitals?

[`VitalsData`](../../types/interfaces/VitalsData.md)

### environment?

[`BriefingState`](../../types/interfaces/BriefingState.md)

## Returns

[`InjurySeverityResult`](../interfaces/InjurySeverityResult.md)

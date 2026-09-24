[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/patrol/oet-engine](../README.md) / calculateInjurySeverity

# Function: calculateInjurySeverity()

> **calculateInjurySeverity**(`patient?`, `vitals?`, `environment?`): [`InjurySeverityResult`](../interfaces/InjurySeverityResult.md)

Calculates injury severity score (0-100), level, and physiological factors
based on patient complaint, mechanism of injury, vitals, and environment.

Authoritative Clinical Sources:
- AVPU / GCS: National Ski Patrol (NSP) Outdoor Emergency Care (OEC) 6th Ed., Ch. 6 "Patient Assessment";
  Glasgow Coma Scale (Teasdale & Jennett, 1974, Lancet 304(7884):81-84).
- SpO2 (hypoxia < 92%, severe < 85%): NSP OEC 6th Ed., Ch. 6 "Vital Signs" & Ch. 12 "Respiratory Emergencies".
- Respiration (< 10 or > 30 bpm) & Heart Rate (> 130 or < 40 bpm): START Triage Protocol (Super & Benson, 1983);
  NSP OEC 6th Ed., Ch. 6.
- BP Systolic (< 90 mmHg hypotension/shock): NSP OEC 6th Ed., Ch. 9 "Shock".
- Neurovascular PMS (Pulse, Motor, Sensory): NSP OEC 6th Ed., Ch. 20 "Musculoskeletal Trauma".
- High-energy Mechanism & Trauma Suspicions: CDC Field Triage Guidelines for Injured Patients; NSP OEC 6th Ed., Ch. 15.

## Parameters

### patient?

`Partial`\<[`PatientState`](../../types/interfaces/PatientState.md)\>

### vitals?

[`VitalsData`](../../types/interfaces/VitalsData.md)

### environment?

[`BriefingState`](../../types/interfaces/BriefingState.md)

## Returns

[`InjurySeverityResult`](../interfaces/InjurySeverityResult.md)

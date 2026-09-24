[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/patrol/oet-engine](../README.md) / assignTransportPriority

# Function: assignTransportPriority()

> **assignTransportPriority**(`input`, `vitalsOverride?`): [`TransportPriorityAssignment`](../interfaces/TransportPriorityAssignment.md)

Assigns transport triage priority (RED, YELLOW, GREEN, BLACK) based on
injury severity assessment or patient state.

Authoritative Triage Framework:
- START Triage System Protocol (Simple Triage and Rapid Treatment - Super & Benson, 1983)
- National Ski Patrol Outdoor Emergency Care (OEC) 6th Ed., Ch. 35 "Multiple-Casualty Incidents"

## Parameters

### input

`Partial`\<[`PatientState`](../../types/interfaces/PatientState.md)\> \| [`InjurySeverityResult`](../interfaces/InjurySeverityResult.md)

### vitalsOverride?

[`VitalsData`](../../types/interfaces/VitalsData.md)

## Returns

[`TransportPriorityAssignment`](../interfaces/TransportPriorityAssignment.md)

[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/patrol/engine](../README.md) / deriveRevealedPatientState

# Function: deriveRevealedPatientState()

> **deriveRevealedPatientState**(`scenario`, `actionHistory`, `vitalsHistory?`): `Partial`\<[`PatientState`](../../types/interfaces/PatientState.md)\>

Derives progressive patient assessment state from cumulative action and vitals history.

## Parameters

### scenario

[`PatrolScenario`](../../types/interfaces/PatrolScenario.md) \| `null`

### actionHistory

[`ScenarioAction`](../../types/interfaces/ScenarioAction.md)[]

### vitalsHistory?

[`VitalsData`](../../types/interfaces/VitalsData.md)[] = `[]`

## Returns

`Partial`\<[`PatientState`](../../types/interfaces/PatientState.md)\>

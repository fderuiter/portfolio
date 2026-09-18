[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/patrol/types](../README.md) / ShiftState

# Interface: ShiftState

## Properties

### actionHistory

> **actionHistory**: [`ScenarioAction`](ScenarioAction.md)[]

***

### activeAmbientEvent?

> `optional` **activeAmbientEvent?**: [`AmbientEvent`](AmbientEvent.md) \| `null`

***

### activeEvents

> **activeEvents**: [`PatrolEvent`](PatrolEvent.md)[]

***

### currentScenarioId

> **currentScenarioId**: `string` \| `null`

***

### currentVitals?

> `optional` **currentVitals?**: [`VitalsData`](VitalsData.md)

***

### incidentsCompleted

> **incidentsCompleted**: `number`

***

### isCompleted

> **isCompleted**: `boolean`

***

### operationalState?

> `optional` **operationalState?**: [`ShiftOperationalState`](ShiftOperationalState.md)

***

### patientCondition?

> `optional` **patientCondition?**: `"critical"` \| `"stable"` \| `"deteriorating"` \| `"worsened"`

***

### phase

> **phase**: [`ShiftPhase`](../type-aliases/ShiftPhase.md)

***

### resolvedAmbientEvents?

> `optional` **resolvedAmbientEvents?**: `string`[]

***

### revealedActors?

> `optional` **revealedActors?**: [`PatrolActor`](PatrolActor.md)[]

***

### revealedEnvironment?

> `optional` **revealedEnvironment?**: `Partial`\<[`EnvironmentState`](EnvironmentState.md)\>

***

### revealedPatient?

> `optional` **revealedPatient?**: `Partial`\<[`PatientState`](PatientState.md)\>

***

### sceneSafetySecured?

> `optional` **sceneSafetySecured?**: `boolean`

***

### sceneSafetyStatus?

> `optional` **sceneSafetyStatus?**: `"compromised"` \| `"unassessed"` \| `"safe"`

***

### score

> **score**: `number`

***

### timeElapsedMinutes

> **timeElapsedMinutes**: `number`

***

### vitalsHistory

> **vitalsHistory**: [`VitalsData`](VitalsData.md)[]

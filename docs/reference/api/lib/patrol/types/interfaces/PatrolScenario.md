[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/patrol/types](../README.md) / PatrolScenario

# Interface: PatrolScenario

## Properties

### actions

> **actions**: [`ScenarioAction`](ScenarioAction.md)[]

***

### actors?

> `optional` **actors?**: [`PatrolActor`](PatrolActor.md)[]

***

### category?

> `optional` **category?**: `string`

***

### coordinates?

> `optional` **coordinates?**: `object`

Authentic Welch Village geospatial coordinates for dispatch and beacon anchoring (Issue #835).

#### x

> **x**: `number`

#### y

> **y**: `number`

#### zone?

> `optional` **zone?**: `"main"` \| `"back-bowl"`

***

### debriefRules

> **debriefRules**: [`DebriefRule`](DebriefRule.md)[]

***

### description?

> `optional` **description?**: `string`

***

### dialogueMoments?

> `optional` **dialogueMoments?**: [`DialogueMoment`](DialogueMoment.md)[]

Interpersonal/delegation dialogue beats woven into this scenario (Issue #752).

***

### difficulty?

> `optional` **difficulty?**: `"beginner"` \| `"intermediate"` \| `"advanced"`

***

### dispatchPrompt?

> `optional` **dispatchPrompt?**: `string`

***

### environment?

> `optional` **environment?**: [`EnvironmentState`](EnvironmentState.md)

***

### estimatedMinutes?

> `optional` **estimatedMinutes?**: `number`

***

### id

> **id**: `string`

***

### initialVitals?

> `optional` **initialVitals?**: [`VitalsData`](VitalsData.md)

***

### location?

> `optional` **location?**: `string`

***

### patient?

> `optional` **patient?**: [`PatientState`](PatientState.md)

***

### subtitle?

> `optional` **subtitle?**: `string`

***

### title

> **title**: `string`

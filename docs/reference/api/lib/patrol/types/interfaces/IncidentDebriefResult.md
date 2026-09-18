[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/patrol/types](../README.md) / IncidentDebriefResult

# Interface: IncidentDebriefResult

Rule-based debrief result for a single incident, produced by
`evaluateIncidentDebrief` from that incident's `PatrolEvent[]` slice alone.

## Properties

### dimensions

> **dimensions**: `Record`\<[`DebriefDimension`](../type-aliases/DebriefDimension.md), [`DimensionScore`](DimensionScore.md)\>

***

### observations

> **observations**: [`QualitativeObservation`](QualitativeObservation.md)[]

***

### oetSummary?

> `optional` **oetSummary?**: `object`

#### controlledStops

> **controlledStops**: `number`

#### excessiveSpeedSeconds

> **excessiveSpeedSeconds**: `number`

#### judgmentScore

> **judgmentScore**: `number`

#### rideComfort

> **rideComfort**: `"moderate"` \| `"smooth"` \| `"rough"`

***

### overallRating

> **overallRating**: `string`

***

### scenarioId

> **scenarioId**: `string`

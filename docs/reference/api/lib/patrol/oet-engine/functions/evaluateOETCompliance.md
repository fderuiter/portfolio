[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/patrol/oet-engine](../README.md) / evaluateOETCompliance

# Function: evaluateOETCompliance()

> **evaluateOETCompliance**(`scenario`, `_actionsTaken`, `eventsOrMetrics?`): `object`

Evaluates OET compliance score and debrief rules.

Checks scenario debrief rules alongside live descent metrics when available.

## Parameters

### scenario

[`PatrolScenario`](../../types/interfaces/PatrolScenario.md)

### \_actionsTaken

[`ScenarioAction`](../../types/interfaces/ScenarioAction.md)[]

### eventsOrMetrics?

[`PatrolEvent`](../../types/interfaces/PatrolEvent.md) \| [`PatrolEvent`](../../types/interfaces/PatrolEvent.md)[] \| [`OetMetrics`](../../types/interfaces/OetMetrics.md)

## Returns

`object`

### failedCount

> **failedCount**: `number`

### passedCount

> **passedCount**: `number`

### score

> **score**: `number`

[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/clinical-trial-chaos/engine](../README.md) / validateObservationChoice

# Function: validateObservationChoice()

> **validateObservationChoice**(`observation`, `selectedChoice`, `activeProtocol?`): `object`

Validates a user's multi-choice answer on a clinical observation using authored AST conditions.

## Parameters

### observation

[`ClinicalObservation`](../../types/interfaces/ClinicalObservation.md)

### selectedChoice

`string`

### activeProtocol?

[`StudyProtocol`](../../../crf/types/interfaces/StudyProtocol.md) \| `null`

## Returns

`object`

### explanation

> **explanation**: `string`

### isAstEvaluated

> **isAstEvaluated**: `boolean`

### isValid

> **isValid**: `boolean`

### observation

> **observation**: [`ClinicalObservation`](../../types/interfaces/ClinicalObservation.md)

### ruleName?

> `optional` **ruleName?**: `string`

### scoreDelta

> **scoreDelta**: `number`

### suspicionDelta

> **suspicionDelta**: `number`

[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/clinical-trial-chaos/engine](../README.md) / validateObservationChoice

# Function: validateObservationChoice()

> **validateObservationChoice**(`observation`, `selectedChoice`): `object`

Defined in: [lib/clinical-trial-chaos/engine.ts:117](https://github.com/fderuiter/portfolio/blob/main/lib/clinical-trial-chaos/engine.ts#L117)

Validates a user's multi-choice answer on a clinical observation.

## Parameters

### observation

[`ClinicalObservation`](../../types/interfaces/ClinicalObservation.md)

### selectedChoice

`string`

## Returns

`object`

### explanation

> **explanation**: `string`

### isValid

> **isValid**: `boolean`

### observation

> **observation**: [`ClinicalObservation`](../../types/interfaces/ClinicalObservation.md)

### scoreDelta

> **scoreDelta**: `number`

### suspicionDelta

> **suspicionDelta**: `number`

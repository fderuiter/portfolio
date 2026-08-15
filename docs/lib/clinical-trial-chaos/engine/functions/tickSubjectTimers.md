[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/clinical-trial-chaos/engine](../README.md) / tickSubjectTimers

# Function: tickSubjectTimers()

> **tickSubjectTimers**(`subjects`, `deltaSeconds`): `object`

Defined in: [lib/clinical-trial-chaos/engine.ts:205](https://github.com/fderuiter/portfolio/blob/main/lib/clinical-trial-chaos/engine.ts#L205)

Advances conveyor subjects timer by deltaSeconds.

## Parameters

### subjects

[`ClinicalSubject`](../../types/interfaces/ClinicalSubject.md)[]

### deltaSeconds

`number`

## Returns

`object`

### expiredSubjects

> **expiredSubjects**: [`ClinicalSubject`](../../types/interfaces/ClinicalSubject.md)[]

### updatedSubjects

> **updatedSubjects**: [`ClinicalSubject`](../../types/interfaces/ClinicalSubject.md)[]

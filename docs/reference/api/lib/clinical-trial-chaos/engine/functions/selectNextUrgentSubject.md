[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/clinical-trial-chaos/engine](../README.md) / selectNextUrgentSubject

# Function: selectNextUrgentSubject()

> **selectNextUrgentSubject**(`queue`): [`ClinicalSubject`](../../types/interfaces/ClinicalSubject.md) \| `null`

Picks the dossier to load after a submission: SAE cases first, then the
least time remaining, then the oldest arrival, then subject id, so the
choice is deterministic. Returns null when nothing is pending.

## Parameters

### queue

readonly [`ClinicalSubject`](../../types/interfaces/ClinicalSubject.md)[]

## Returns

[`ClinicalSubject`](../../types/interfaces/ClinicalSubject.md) \| `null`

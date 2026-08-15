[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/clinical-trial-chaos/scenarios](../README.md) / generateClinicalSubject

# Function: generateClinicalSubject()

> **generateClinicalSubject**(`errorProbability?`, `forceSAE?`, `customSeq?`): [`ClinicalSubject`](../../types/interfaces/ClinicalSubject.md)

Defined in: [lib/clinical-trial-chaos/scenarios.ts:257](https://github.com/fderuiter/portfolio/blob/main/lib/clinical-trial-chaos/scenarios.ts#L257)

Generates a random or seeded ClinicalSubject with 2-4 observations.

## Parameters

### errorProbability?

`number` = `0.5`

Probability that any given observation has a typo/anomaly (0 to 1).

### forceSAE?

`boolean` = `false`

Whether this subject is an emergency SAE priority rush.

### customSeq?

`number`

## Returns

[`ClinicalSubject`](../../types/interfaces/ClinicalSubject.md)

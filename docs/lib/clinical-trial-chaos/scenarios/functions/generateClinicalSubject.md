[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/clinical-trial-chaos/scenarios](../README.md) / generateClinicalSubject

# Function: generateClinicalSubject()

> **generateClinicalSubject**(`errorProbability?`, `forceSAE?`, `customSeq?`, `activeDomains?`): [`ClinicalSubject`](../../types/interfaces/ClinicalSubject.md)

Defined in: [lib/clinical-trial-chaos/scenarios.ts:702](https://github.com/fderuiter/portfolio/blob/main/lib/clinical-trial-chaos/scenarios.ts#L702)

Generates a random or seeded ClinicalSubject with 2-4 observations.

## Parameters

### errorProbability?

`number` = `0.5`

### forceSAE?

`boolean` = `false`

### customSeq?

`number`

### activeDomains?

[`CDISCDomain`](../../types/type-aliases/CDISCDomain.md)[] = `...`

## Returns

[`ClinicalSubject`](../../types/interfaces/ClinicalSubject.md)

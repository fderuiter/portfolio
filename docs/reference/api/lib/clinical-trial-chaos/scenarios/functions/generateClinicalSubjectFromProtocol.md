[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/clinical-trial-chaos/scenarios](../README.md) / generateClinicalSubjectFromProtocol

# Function: generateClinicalSubjectFromProtocol()

> **generateClinicalSubjectFromProtocol**(`protocol`, `errorProbability?`, `forceSAE?`, `customSeq?`, `activeDomains?`): [`ClinicalSubject`](../../types/interfaces/ClinicalSubject.md)

Generates a ClinicalSubject populated directly from an active StudyProtocol definition.
Observations route only to `activeDomains`, and each carries a single-field
answer rule that exactly one of its options satisfies.

## Parameters

### protocol

[`StudyProtocol`](../../../crf/types/interfaces/StudyProtocol.md)

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

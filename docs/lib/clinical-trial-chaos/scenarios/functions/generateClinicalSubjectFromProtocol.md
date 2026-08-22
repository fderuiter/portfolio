[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/clinical-trial-chaos/scenarios](../README.md) / generateClinicalSubjectFromProtocol

# Function: generateClinicalSubjectFromProtocol()

> **generateClinicalSubjectFromProtocol**(`protocol`, `errorProbability?`, `forceSAE?`, `customSeq?`): [`ClinicalSubject`](../../types/interfaces/ClinicalSubject.md)

Defined in: [lib/clinical-trial-chaos/scenarios.ts:818](https://github.com/fderuiter/portfolio/blob/main/lib/clinical-trial-chaos/scenarios.ts#L818)

Generates a ClinicalSubject populated directly from an active StudyProtocol definition.

## Parameters

### protocol

[`StudyProtocol`](../../../crf/types/interfaces/StudyProtocol.md)

### errorProbability?

`number` = `0.5`

### forceSAE?

`boolean` = `false`

### customSeq?

`number`

## Returns

[`ClinicalSubject`](../../types/interfaces/ClinicalSubject.md)

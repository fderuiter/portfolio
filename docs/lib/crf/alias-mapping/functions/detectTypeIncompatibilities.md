[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/alias-mapping](../README.md) / detectTypeIncompatibilities

# Function: detectTypeIncompatibilities()

> **detectTypeIncompatibilities**(`previousProtocol`, `draftProtocol`): [`TypeIncompatibilityNotice`](../interfaces/TypeIncompatibilityNotice.md)[]

Defined in: [lib/crf/alias-mapping.ts:30](https://github.com/fderuiter/portfolio/blob/main/lib/crf/alias-mapping.ts#L30)

Detects data type changes between previous published schema and draft schema that require pre-publication notice.

## Parameters

### previousProtocol

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

### draftProtocol

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

## Returns

[`TypeIncompatibilityNotice`](../interfaces/TypeIncompatibilityNotice.md)[]

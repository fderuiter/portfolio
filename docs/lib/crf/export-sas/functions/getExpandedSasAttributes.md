[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/export-sas](../README.md) / getExpandedSasAttributes

# Function: getExpandedSasAttributes()

> **getExpandedSasAttributes**(`field`, `study`, `usedNames?`): [`ExpandedSasField`](../interfaces/ExpandedSasField.md)[]

Defined in: [lib/crf/export-sas.ts:222](https://github.com/fderuiter/portfolio/blob/main/lib/crf/export-sas.ts#L222)

Expands fields, converting multi_select and checkbox fields into individual dichotomous sub-variables.

## Parameters

### field

[`CRFField`](../../types/interfaces/CRFField.md)

### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

### usedNames?

`Set`\<`string`\> = `...`

## Returns

[`ExpandedSasField`](../interfaces/ExpandedSasField.md)[]

[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/usdm-adapter](../README.md) / exportStudyToUsdmObject

# Function: exportStudyToUsdmObject()

> **exportStudyToUsdmObject**(`study`): [`UsdmDocument`](../interfaces/UsdmDocument.md)

Defined in: [lib/crf/usdm-adapter.ts:234](https://github.com/fderuiter/portfolio/blob/main/lib/crf/usdm-adapter.ts#L234)

Transforms a CRF Studio StudyProtocol into a CDISC USDM Graph representation.
Decouples field-level presentation properties into independent BiomedicalConcept nodes.
Maps linear visit target days to epoch-based encounter schedules.

## Parameters

### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

## Returns

[`UsdmDocument`](../interfaces/UsdmDocument.md)

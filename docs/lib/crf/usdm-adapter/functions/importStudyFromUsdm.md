[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/usdm-adapter](../README.md) / importStudyFromUsdm

# Function: importStudyFromUsdm()

> **importStudyFromUsdm**(`usdmInput`): [`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

Defined in: [lib/crf/usdm-adapter.ts:316](https://github.com/fderuiter/portfolio/blob/main/lib/crf/usdm-adapter.ts#L316)

Imports a CDISC USDM JSON document or object into an internal CRF Studio StudyProtocol.
Reassembles linear encounter schedules into visit sequences and resolves decoupled BiomedicalConcept definitions.

## Parameters

### usdmInput

`string` \| `Record`\<`string`, `unknown`\> \| [`UsdmDocument`](../interfaces/UsdmDocument.md)

## Returns

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

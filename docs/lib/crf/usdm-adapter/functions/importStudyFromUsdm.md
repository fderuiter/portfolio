[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/usdm-adapter](../README.md) / importStudyFromUsdm

# Function: importStudyFromUsdm()

> **importStudyFromUsdm**(`usdmInput`): [`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

Defined in: [lib/crf/usdm-adapter.ts:456](https://github.com/fderuiter/portfolio/blob/main/lib/crf/usdm-adapter.ts#L456)

Imports a CDISC USDM JSON document or object into an internal CRF Studio StudyProtocol.
Reassembles linear encounter schedules into visit sequences, extracts valueSets and codeList references into study codelists,
maps windowBefore and windowAfter visit tolerances to constrain study schedule rules, and resolves decoupled BiomedicalConcept definitions.

## Parameters

### usdmInput

`string` \| `Record`\<`string`, `unknown`\> \| [`UsdmDocument`](../interfaces/UsdmDocument.md)

## Returns

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/usdm-adapter](../README.md) / diffUsdmProtocols

# Function: diffUsdmProtocols()

> **diffUsdmProtocols**(`usdmAInput`, `usdmBInput`): [`UsdmDiffSummary`](../interfaces/UsdmDiffSummary.md)

Defined in: [lib/crf/usdm-adapter.ts:426](https://github.com/fderuiter/portfolio/blob/main/lib/crf/usdm-adapter.ts#L426)

Performs semantic version diffing between two USDM protocol revisions.
Identifies added, modified, or removed arms, epochs, cohorts, biomedical concepts, encounters, and activities.

## Parameters

### usdmAInput

`string` \| `Record`\<`string`, `unknown`\> \| [`UsdmDocument`](../interfaces/UsdmDocument.md)

### usdmBInput

`string` \| `Record`\<`string`, `unknown`\> \| [`UsdmDocument`](../interfaces/UsdmDocument.md)

## Returns

[`UsdmDiffSummary`](../interfaces/UsdmDiffSummary.md)

[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/study-baseline-diff](../README.md) / compareStudyToBaseline

# Function: compareStudyToBaseline()

> **compareStudyToBaseline**(`current`, `baselineStudy`, `baselineMeta`): [`BaselineComparisonResult`](../interfaces/BaselineComparisonResult.md)

Compares the current working draft against a named baseline snapshot,
matching every object by its stable id (never by array position) so
reorders never masquerade as adds/removes, and a same-id rename or move
is reported as a single "modified" entry rather than a delete + add pair.

## Parameters

### current

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

### baselineStudy

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

### baselineMeta

#### id

`string`

#### label

`string`

#### versionTag

`string`

## Returns

[`BaselineComparisonResult`](../interfaces/BaselineComparisonResult.md)

[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/neuro/qa-engine](../README.md) / evaluateQAMetrics

# Function: evaluateQAMetrics()

> **evaluateQAMetrics**(`scenario`, `volume`, `controlPoints`, `voxelEdits`): [`QAMetrics`](../../types/interfaces/QAMetrics.md)

Defined in: [lib/neuro/qa-engine.ts:13](https://github.com/fderuiter/portfolio/blob/main/lib/neuro/qa-engine.ts#L13)

Evaluate the live QA status of the current workspace state.

## Parameters

### scenario

[`ScenarioConfig`](../../types/interfaces/ScenarioConfig.md)

### volume

[`SyntheticVolume`](../../volume-generator/interfaces/SyntheticVolume.md)

### controlPoints

[`ControlPoint`](../../types/interfaces/ControlPoint.md)[]

### voxelEdits

[`VoxelEdit`](../../types/interfaces/VoxelEdit.md)[]

## Returns

[`QAMetrics`](../../types/interfaces/QAMetrics.md)

[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useDebouncedDiagnostics](../README.md) / useDebouncedDiagnostics

# Function: useDebouncedDiagnostics()

> **useDebouncedDiagnostics**(`study`, `options?`): [`UseDebouncedDiagnosticsResult`](../interfaces/UseDebouncedDiagnosticsResult.md)

Custom hook to calculate aggregate form issue counts for the studio header badge.
Defers heavy linting calculations during active typing using trailing-edge idle scheduling
and React transition wrappers (startTransition) to keep the main UI thread responsive (60fps).

Preserves object reference identity without Web Worker serialization or message cloning.
Immediately cancels pending computations on new inputs, undo, or redo actions.

## Parameters

### study

[`StudyProtocol`](../../../lib/crf/types/interfaces/StudyProtocol.md)

### options?

[`UseDebouncedDiagnosticsOptions`](../interfaces/UseDebouncedDiagnosticsOptions.md) = `{}`

## Returns

[`UseDebouncedDiagnosticsResult`](../interfaces/UseDebouncedDiagnosticsResult.md)

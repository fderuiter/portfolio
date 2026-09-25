[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/clinical-trial-chaos/engine](../README.md) / getCalibrationStep

# Function: getCalibrationStep()

> **getCalibrationStep**(`queue`, `subjectId`): [`CalibrationStep`](../type-aliases/CalibrationStep.md)

Derives the calibration step from the live queue: the guided subject still
has flagged fields ("fix"), is clean and waiting to be routed ("route"), or
has left the queue because it was submitted ("complete").

## Parameters

### queue

readonly [`ClinicalSubject`](../../types/interfaces/ClinicalSubject.md)[]

### subjectId

`string`

## Returns

[`CalibrationStep`](../type-aliases/CalibrationStep.md)

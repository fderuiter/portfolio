[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/clinical-trial-chaos/engine](../README.md) / getObservationChoices

# Function: getObservationChoices()

> **getObservationChoices**(`observation`): `string`[]

The choices the fix dialog offers for an observation. An empty or missing
option list falls back to the expected value and the raw entry, so the
dialog never opens without a button to press.

## Parameters

### observation

[`ClinicalObservation`](../../types/interfaces/ClinicalObservation.md)

## Returns

`string`[]

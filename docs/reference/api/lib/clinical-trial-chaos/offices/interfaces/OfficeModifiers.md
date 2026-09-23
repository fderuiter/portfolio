[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/clinical-trial-chaos/offices](../README.md) / OfficeModifiers

# Interface: OfficeModifiers

Tunable difficulty knobs an office applies on top of the phase baseline.
Multipliers of 1 and deltas of 0 leave the baseline untouched.

## Properties

### amendmentIntervalMultiplier

> **amendmentIntervalMultiplier**: `number`

Scales seconds between random protocol amendments.

***

### errorChanceDelta

> **errorChanceDelta**: `number`

Added to the phase error probability, clamped to 0.05–0.95.

***

### powerUpChargeBonus

> **powerUpChargeBonus**: `number`

Extra power-up charge granted on every charge event.

***

### scoreMultiplier

> **scoreMultiplier**: `number`

Scales points awarded for a signed submission.

***

### spawnIntervalMultiplier

> **spawnIntervalMultiplier**: `number`

Scales seconds between subject spawns (lower = busier conveyor).

***

### startingSuspicion

> **startingSuspicion**: `number`

Auditor suspicion at shift start, 0–100.

***

### subjectTimeMultiplier

> **subjectTimeMultiplier**: `number`

Scales each subject's countdown before it expires on the conveyor.

***

### suspicionDecayMultiplier

> **suspicionDecayMultiplier**: `number`

Scales the auditor's passive suspicion decay (lower = grudge-holder).

[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/ast-evaluator](../README.md) / calculateBazettQTc

# Function: calculateBazettQTc()

> **calculateBazettQTc**(`qtMs`, `rrSec`): `number`

Defined in: [lib/crf/ast-evaluator.ts:355](https://github.com/fderuiter/portfolio/blob/main/lib/crf/ast-evaluator.ts#L355)

Calculates Bazett Corrected QT interval (QTcB) in milliseconds.

## Parameters

### qtMs

`number`

Raw QT interval in ms

### rrSec

`number`

RR interval in seconds (or 60 / heartRate)

## Returns

`number`

Corrected QTc in ms

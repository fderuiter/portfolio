[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/ast-evaluator](../README.md) / calculateCockcroftGaultCrCl

# Function: calculateCockcroftGaultCrCl()

> **calculateCockcroftGaultCrCl**(`age`, `weightKg`, `serumCrMgDl`, `isFemale`): `number`

Defined in: [lib/crf/ast-evaluator.ts:336](https://github.com/fderuiter/portfolio/blob/main/lib/crf/ast-evaluator.ts#L336)

Calculates Cockcroft-Gault Creatinine Clearance (CrCl) in mL/min.

## Parameters

### age

`number`

Patient age in years

### weightKg

`number`

Patient weight in kilograms

### serumCrMgDl

`number`

Serum creatinine in mg/dL

### isFemale

`boolean`

True if female

## Returns

`number`

Estimated Creatinine Clearance in mL/min

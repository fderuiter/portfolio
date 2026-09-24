[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/validator](../README.md) / ratioFor

# Function: ratioFor()

> **ratioFor**(`statistic`, `subjects`): `object`

Numerator and denominator of a row statistic for a set of subjects.

## Parameters

### statistic

\{ `kind`: `"POPULATION_N"`; \} \| \{ `kind`: `"MEAN_AGE"`; \} \| \{ `kind`: `"SEX_COUNT_PCT"`; `sex`: `"F"` \| `"M"`; \} \| \{ `kind`: `"AGE_AT_LEAST_COUNT_PCT"`; `minAge`: `number`; \} \| \{ `kind`: `"AE_SUBJECT_COUNT_PCT"`; `ledToDiscontinuation?`: `true`; `minGrade?`: `number`; `serious?`: `true`; `soc?`: `string`; `term?`: `string`; \}

### subjects

readonly `object`[]

## Returns

`object`

### denominator

> **denominator**: `number`

### numerator

> **numerator**: `number`

[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/cdisc-controlled-terminology](../README.md) / validateCodelists

# Function: validateCodelists()

> **validateCodelists**(`codelists?`): `object`

Validates a list of codelists for integrity:
- Checks for duplicate codelist IDs.
- Checks for duplicate NCI codelist concept codes.
- Validates NCI C-code regex formatting.
- Checks option uniqueness and option NCI code formats within each codelist.

## Parameters

### codelists?

[`CodelistDefinition`](../../types/interfaces/CodelistDefinition.md)[] = `STANDARD_CODELISTS`

## Returns

`object`

### errors

> **errors**: `string`[]

### valid

> **valid**: `boolean`

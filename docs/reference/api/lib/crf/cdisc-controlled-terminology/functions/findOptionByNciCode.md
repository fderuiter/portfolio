[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/cdisc-controlled-terminology](../README.md) / findOptionByNciCode

# Function: findOptionByNciCode()

> **findOptionByNciCode**(`codelist`, `nciCode`, `codelists?`): [`CodelistOption`](../../types/interfaces/CodelistOption.md) \| `undefined`

Finds an option within a codelist by its NCI Concept Code (e.g. "C49488", "C20197").

## Parameters

### codelist

`string` \| [`CodelistDefinition`](../../types/interfaces/CodelistDefinition.md)

### nciCode

`string`

### codelists?

[`CodelistDefinition`](../../types/interfaces/CodelistDefinition.md)[] = `STANDARD_CODELISTS`

## Returns

[`CodelistOption`](../../types/interfaces/CodelistOption.md) \| `undefined`

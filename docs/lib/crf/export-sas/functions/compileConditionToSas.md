[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/export-sas](../README.md) / compileConditionToSas

# Function: compileConditionToSas()

> **compileConditionToSas**(`cond`, `formFields?`, `study?`): `string`

Defined in: [lib/crf/export-sas.ts:21](https://github.com/fderuiter/portfolio/blob/main/lib/crf/export-sas.ts#L21)

Compiles a single AstCondition into a SAS logical expression.
Variable names are guaranteed to strictly adhere to the 32-character SAS limit.

## Parameters

### cond

[`AstCondition`](../../types/interfaces/AstCondition.md)

### formFields?

[`CRFField`](../../types/interfaces/CRFField.md)[] = `[]`

### study?

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

## Returns

`string`

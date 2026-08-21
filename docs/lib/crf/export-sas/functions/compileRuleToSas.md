[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/export-sas](../README.md) / compileRuleToSas

# Function: compileRuleToSas()

> **compileRuleToSas**(`rule`, `formFields?`, `study?`): `string`

Defined in: [lib/crf/export-sas.ts:79](https://github.com/fderuiter/portfolio/blob/main/lib/crf/export-sas.ts#L79)

Compiles an EditCheckRule AST into executable SAS IF/THEN validation blocks.

## Parameters

### rule

[`EditCheckRule`](../../types/interfaces/EditCheckRule.md)

### formFields?

[`CRFField`](../../types/interfaces/CRFField.md)[] = `[]`

### study?

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

## Returns

`string`

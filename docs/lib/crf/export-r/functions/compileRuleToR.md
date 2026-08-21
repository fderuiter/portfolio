[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/export-r](../README.md) / compileRuleToR

# Function: compileRuleToR()

> **compileRuleToR**(`rule`, `formFields?`, `study?`): `string`

Defined in: [lib/crf/export-r.ts:74](https://github.com/fderuiter/portfolio/blob/main/lib/crf/export-r.ts#L74)

Compiles an EditCheckRule AST into an R validate assertion statement.

## Parameters

### rule

[`EditCheckRule`](../../types/interfaces/EditCheckRule.md)

### formFields?

[`CRFField`](../../types/interfaces/CRFField.md)[] = `[]`

### study?

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

## Returns

`string`

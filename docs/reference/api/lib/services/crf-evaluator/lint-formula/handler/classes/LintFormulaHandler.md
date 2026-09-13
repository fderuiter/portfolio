[**fderuiter-portfolio**](../../../../../../README.md)

***

[fderuiter-portfolio](../../../../../../modules.md) / [lib/services/crf-evaluator/lint-formula/handler](../README.md) / LintFormulaHandler

# Class: LintFormulaHandler

## Implements

- [`LintFormulaSpec`](../../spec/interfaces/LintFormulaSpec.md)

## Constructors

### Constructor

> **new LintFormulaHandler**(): `LintFormulaHandler`

#### Returns

`LintFormulaHandler`

## Methods

### execute()

> **execute**(`input`): [`LintFormulaResult`](../../spec/type-aliases/LintFormulaResult.md)

#### Parameters

##### input

###### allFields?

[`CRFField`](../../../../../crf/types/interfaces/CRFField.md)[] = `...`

###### fieldsList

[`CRFField`](../../../../../crf/types/interfaces/CRFField.md)[] = `...`

###### formula

`string` = `...`

###### targetFieldId?

`string` = `...`

#### Returns

[`LintFormulaResult`](../../spec/type-aliases/LintFormulaResult.md)

#### Implementation of

[`LintFormulaSpec`](../../spec/interfaces/LintFormulaSpec.md).[`execute`](../../spec/interfaces/LintFormulaSpec.md#execute)

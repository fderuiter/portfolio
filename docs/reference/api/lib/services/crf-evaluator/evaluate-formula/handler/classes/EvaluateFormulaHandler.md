[**fderuiter-portfolio**](../../../../../../README.md)

***

[fderuiter-portfolio](../../../../../../modules.md) / [lib/services/crf-evaluator/evaluate-formula/handler](../README.md) / EvaluateFormulaHandler

# Class: EvaluateFormulaHandler

## Implements

- [`EvaluateFormulaSpec`](../../spec/interfaces/EvaluateFormulaSpec.md)

## Constructors

### Constructor

> **new EvaluateFormulaHandler**(): `EvaluateFormulaHandler`

#### Returns

`EvaluateFormulaHandler`

## Methods

### execute()

> **execute**(`input`): [`EvaluateFormulaResult`](../../spec/type-aliases/EvaluateFormulaResult.md)

#### Parameters

##### input

###### fieldsList

[`CRFField`](../../../../../crf/types/interfaces/CRFField.md)[] = `...`

###### fieldValues

`Record`\<`string`, `unknown`\> = `...`

###### formula

`string` = `...`

#### Returns

[`EvaluateFormulaResult`](../../spec/type-aliases/EvaluateFormulaResult.md)

#### Implementation of

[`EvaluateFormulaSpec`](../../spec/interfaces/EvaluateFormulaSpec.md).[`execute`](../../spec/interfaces/EvaluateFormulaSpec.md#execute)

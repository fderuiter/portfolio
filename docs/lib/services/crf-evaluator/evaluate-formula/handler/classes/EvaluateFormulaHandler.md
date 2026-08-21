[**fderuiter-portfolio**](../../../../../../README.md)

***

[fderuiter-portfolio](../../../../../../modules.md) / [lib/services/crf-evaluator/evaluate-formula/handler](../README.md) / EvaluateFormulaHandler

# Class: EvaluateFormulaHandler

Defined in: [lib/services/crf-evaluator/evaluate-formula/handler.ts:9](https://github.com/fderuiter/portfolio/blob/main/lib/services/crf-evaluator/evaluate-formula/handler.ts#L9)

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

Defined in: [lib/services/crf-evaluator/evaluate-formula/handler.ts:10](https://github.com/fderuiter/portfolio/blob/main/lib/services/crf-evaluator/evaluate-formula/handler.ts#L10)

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

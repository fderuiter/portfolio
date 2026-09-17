[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useCrfService](../README.md) / useCrfService

# Function: useCrfService()

> **useCrfService**(): `object`

Custom React hook providing access to CRF Studio evaluation and linter domain service operations.
Wraps EvaluateFormulaHandler, LintFormulaHandler, and LintFormHandler with Zod input validation
and zero-exception ServiceResult error handling.

## Returns

`object`

### evaluateFormula

> **evaluateFormula**: (`input`) => [`EvaluateFormulaResult`](../../../lib/services/crf-evaluator/evaluate-formula/spec/type-aliases/EvaluateFormulaResult.md)

#### Parameters

##### input

###### fieldsList

[`CRFField`](../../../lib/crf/types/interfaces/CRFField.md)[] = `...`

###### fieldValues

`Record`\<`string`, `unknown`\> = `...`

###### formula

`string` = `...`

#### Returns

[`EvaluateFormulaResult`](../../../lib/services/crf-evaluator/evaluate-formula/spec/type-aliases/EvaluateFormulaResult.md)

### lintForm

> **lintForm**: (`input`) => [`LintFormResult`](../../../lib/services/crf-evaluator/lint-form/spec/type-aliases/LintFormResult.md)

#### Parameters

##### input

###### form

[`CRFForm`](../../../lib/crf/types/interfaces/CRFForm.md) = `...`

#### Returns

[`LintFormResult`](../../../lib/services/crf-evaluator/lint-form/spec/type-aliases/LintFormResult.md)

### lintFormula

> **lintFormula**: (`input`) => [`LintFormulaResult`](../../../lib/services/crf-evaluator/lint-formula/spec/type-aliases/LintFormulaResult.md)

#### Parameters

##### input

###### allFields?

[`CRFField`](../../../lib/crf/types/interfaces/CRFField.md)[] = `...`

###### fieldsList

[`CRFField`](../../../lib/crf/types/interfaces/CRFField.md)[] = `...`

###### formula

`string` = `...`

###### targetFieldId?

`string` = `...`

#### Returns

[`LintFormulaResult`](../../../lib/services/crf-evaluator/lint-formula/spec/type-aliases/LintFormulaResult.md)

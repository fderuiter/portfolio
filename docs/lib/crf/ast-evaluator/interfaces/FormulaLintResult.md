[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/ast-evaluator](../README.md) / FormulaLintResult

# Interface: FormulaLintResult

Defined in: [lib/crf/ast-evaluator.ts:47](https://github.com/fderuiter/portfolio/blob/main/lib/crf/ast-evaluator.ts#L47)

## Properties

### diagnostics

> **diagnostics**: [`FormulaDiagnostic`](FormulaDiagnostic.md)[]

Defined in: [lib/crf/ast-evaluator.ts:50](https://github.com/fderuiter/portfolio/blob/main/lib/crf/ast-evaluator.ts#L50)

***

### isValid

> **isValid**: `boolean`

Defined in: [lib/crf/ast-evaluator.ts:48](https://github.com/fderuiter/portfolio/blob/main/lib/crf/ast-evaluator.ts#L48)

***

### referencedVariables

> **referencedVariables**: `object`[]

Defined in: [lib/crf/ast-evaluator.ts:52](https://github.com/fderuiter/portfolio/blob/main/lib/crf/ast-evaluator.ts#L52)

#### exists

> **exists**: `boolean`

#### field?

> `optional` **field?**: [`CRFField`](../../types/interfaces/CRFField.md)

#### isNumeric

> **isNumeric**: `boolean`

#### name

> **name**: `string`

***

### tokens

> **tokens**: [`HighlightToken`](HighlightToken.md)[]

Defined in: [lib/crf/ast-evaluator.ts:49](https://github.com/fderuiter/portfolio/blob/main/lib/crf/ast-evaluator.ts#L49)

***

### unmatchedBracketIndices

> **unmatchedBracketIndices**: `number`[]

Defined in: [lib/crf/ast-evaluator.ts:51](https://github.com/fderuiter/portfolio/blob/main/lib/crf/ast-evaluator.ts#L51)

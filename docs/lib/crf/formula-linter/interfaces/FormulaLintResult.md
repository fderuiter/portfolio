[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/formula-linter](../README.md) / FormulaLintResult

# Interface: FormulaLintResult

Defined in: [lib/crf/formula-linter.ts:36](https://github.com/fderuiter/portfolio/blob/main/lib/crf/formula-linter.ts#L36)

## Properties

### diagnostics

> **diagnostics**: [`FormulaDiagnostic`](FormulaDiagnostic.md)[]

Defined in: [lib/crf/formula-linter.ts:39](https://github.com/fderuiter/portfolio/blob/main/lib/crf/formula-linter.ts#L39)

***

### isValid

> **isValid**: `boolean`

Defined in: [lib/crf/formula-linter.ts:37](https://github.com/fderuiter/portfolio/blob/main/lib/crf/formula-linter.ts#L37)

***

### referencedVariables

> **referencedVariables**: `object`[]

Defined in: [lib/crf/formula-linter.ts:41](https://github.com/fderuiter/portfolio/blob/main/lib/crf/formula-linter.ts#L41)

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

Defined in: [lib/crf/formula-linter.ts:38](https://github.com/fderuiter/portfolio/blob/main/lib/crf/formula-linter.ts#L38)

***

### unmatchedBracketIndices

> **unmatchedBracketIndices**: `number`[]

Defined in: [lib/crf/formula-linter.ts:40](https://github.com/fderuiter/portfolio/blob/main/lib/crf/formula-linter.ts#L40)

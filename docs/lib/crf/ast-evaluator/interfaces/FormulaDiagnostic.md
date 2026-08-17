[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/ast-evaluator](../README.md) / FormulaDiagnostic

# Interface: FormulaDiagnostic

Defined in: [lib/crf/ast-evaluator.ts:26](https://github.com/fderuiter/portfolio/blob/main/lib/crf/ast-evaluator.ts#L26)

## Properties

### code

> **code**: `"UNMATCHED_LPAREN"` \| `"UNMATCHED_RPAREN"` \| `"UNEXPECTED_TOKEN"` \| `"TRAILING_OPERATOR"` \| `"CONSECUTIVE_OPERATORS"` \| `"EMPTY_PARENTHESES"` \| `"UNKNOWN_VARIABLE"` \| `"NON_NUMERIC_VARIABLE"` \| `"UNKNOWN_FUNCTION"` \| `"INVALID_ARITY"` \| `"CIRCULAR_REFERENCE"` \| `"DIVISION_BY_ZERO"` \| `"EMPTY_FORMULA"`

Defined in: [lib/crf/ast-evaluator.ts:31](https://github.com/fderuiter/portfolio/blob/main/lib/crf/ast-evaluator.ts#L31)

***

### end

> **end**: `number`

Defined in: [lib/crf/ast-evaluator.ts:30](https://github.com/fderuiter/portfolio/blob/main/lib/crf/ast-evaluator.ts#L30)

***

### message

> **message**: `string`

Defined in: [lib/crf/ast-evaluator.ts:28](https://github.com/fderuiter/portfolio/blob/main/lib/crf/ast-evaluator.ts#L28)

***

### severity

> **severity**: `"error"` \| `"info"` \| `"warning"`

Defined in: [lib/crf/ast-evaluator.ts:27](https://github.com/fderuiter/portfolio/blob/main/lib/crf/ast-evaluator.ts#L27)

***

### start

> **start**: `number`

Defined in: [lib/crf/ast-evaluator.ts:29](https://github.com/fderuiter/portfolio/blob/main/lib/crf/ast-evaluator.ts#L29)

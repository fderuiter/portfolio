[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/term-compiler](../README.md) / validateTermTags

# Function: validateTermTags()

> **validateTermTags**(`html`, `glossary?`, `source?`): [`TermValidationResult`](../interfaces/TermValidationResult.md)

Defined in: [lib/term-compiler.ts:137](https://github.com/fderuiter/portfolio/blob/main/lib/term-compiler.ts#L137)

Validates term tags in HTML or text strings against the canonical glossary.

## Parameters

### html

`string`

### glossary?

[`TermDefinition`](../../term-glossary/interfaces/TermDefinition.md)[] = `CANONICAL_GLOSSARY`

### source?

`string` = `"inline-content"`

## Returns

[`TermValidationResult`](../interfaces/TermValidationResult.md)

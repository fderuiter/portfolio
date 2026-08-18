[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/utils](../README.md) / EscapeXmlOptions

# Interface: EscapeXmlOptions

Defined in: [lib/utils.ts:15](https://github.com/fderuiter/portfolio/blob/main/lib/utils.ts#L15)

## Properties

### singleQuoteEntity?

> `optional` **singleQuoteEntity?**: `boolean` \| `"&apos;"` \| `"&#39;"`

Defined in: [lib/utils.ts:21](https://github.com/fderuiter/portfolio/blob/main/lib/utils.ts#L21)

Entity format for single quote escaping.
- '&apos;' for standard XML (default)
- '&#39;' for numeric single quote entity (used in term validation and attribute escaping)

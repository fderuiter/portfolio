[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / RedactedCardSchema

# Variable: RedactedCardSchema

> `const` **RedactedCardSchema**: `ZodObject`\<\{ `faceDown`: `ZodLiteral`\<`true`\>; `slot`: `ZodString`; \}, `$strict`\>

A face-down card: an opaque slot and nothing else. It cannot carry face
values, so a blinded or undealt card can be rendered without leaking them.

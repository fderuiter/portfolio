[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / CardFaceSchema

# Variable: CardFaceSchema

> `const` **CardFaceSchema**: `ZodDiscriminatedUnion`\<\[`ZodObject`\<\{ `columns`: `ZodArray`\<`ZodString`\>; `kind`: `ZodLiteral`\<`"TABLE"`\>; `rows`: `ZodArray`\<`ZodObject`\<\{ `label`: `ZodString`; `values`: `ZodArray`\<`ZodString`\>; \}, `$strip`\>\>; \}, `$strip`\>, `ZodObject`\<\{ `columns`: `ZodArray`\<`ZodString`\>; `kind`: `ZodLiteral`\<`"LISTING"`\>; `rows`: `ZodArray`\<`ZodArray`\<`ZodString`\>\>; \}, `$strip`\>, `ZodObject`\<\{ `kind`: `ZodLiteral`\<`"FIGURE"`\>; `plot`: `ZodDiscriminatedUnion`\<\[`ZodObject`\<\{ `series`: `ZodArray`\<`ZodObject`\<\{ `label`: ...; `points`: ...; \}, `$strip`\>\>; `type`: `ZodLiteral`\<`"KM"`\>; \}, `$strip`\>, `ZodObject`\<\{ `series`: `ZodArray`\<`ZodObject`\<\{ `label`: ...; `points`: ...; \}, `$strip`\>\>; `type`: `ZodLiteral`\<`"SPARKLINE"`\>; \}, `$strip`\>, `ZodObject`\<\{ `intervals`: `ZodArray`\<`ZodObject`\<\{ `estimate`: ...; `label`: ...; `lower`: ...; `upper`: ...; \}, `$strip`\>\>; `reference`: `ZodNumber`; `type`: `ZodLiteral`\<`"FOREST"`\>; \}, `$strip`\>\], `"type"`\>; \}, `$strip`\>, `ZodObject`\<\{ `cohort`: `ZodString`; `count`: `ZodNumber`; `kind`: `ZodLiteral`\<`"TOKEN"`\>; \}, `$strip`\>\], `"kind"`\>

A card's face: a live miniature of the output it represents, rendered from
this data rather than from an illustration.

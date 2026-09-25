[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / CardFaceSchema

# Variable: CardFaceSchema

> `const` **CardFaceSchema**: `ZodDiscriminatedUnion`\<\[`ZodObject`\<\{ `columns`: `ZodArray`\<`ZodString`\>; `kind`: `ZodLiteral`\<`"TABLE"`\>; `rows`: `ZodArray`\<`ZodObject`\<\{ `label`: `ZodString`; `values`: `ZodArray`\<`ZodString`\>; \}, `$strip`\>\>; \}, `$strip`\>, `ZodObject`\<\{ `columns`: `ZodArray`\<`ZodString`\>; `kind`: `ZodLiteral`\<`"LISTING"`\>; `rows`: `ZodArray`\<`ZodArray`\<`ZodString`\>\>; \}, `$strip`\>, `ZodObject`\<\{ `atRisk`: `ZodOptional`\<`ZodObject`\<\{ `rows`: `ZodArray`\<`ZodObject`\<\{ `label`: `ZodString`; `values`: `ZodArray`\<...\>; \}, `$strip`\>\>; `times`: `ZodArray`\<`ZodNumber`\>; \}, `$strip`\>\>; `kind`: `ZodLiteral`\<`"FIGURE"`\>; `plot`: `ZodDiscriminatedUnion`\<\[`ZodObject`\<\{ `series`: `ZodArray`\<`ZodObject`\<\{ `censors`: ...; `label`: ...; `points`: ...; \}, `$strip`\>\>; `type`: `ZodLiteral`\<`"KM"`\>; \}, `$strip`\>, `ZodObject`\<\{ `series`: `ZodArray`\<`ZodObject`\<\{ `censors`: ...; `label`: ...; `points`: ...; \}, `$strip`\>\>; `type`: `ZodLiteral`\<`"SPARKLINE"`\>; \}, `$strip`\>, `ZodObject`\<\{ `intervals`: `ZodArray`\<`ZodObject`\<\{ `estimate`: ...; `label`: ...; `lower`: ...; `upper`: ...; \}, `$strip`\>\>; `reference`: `ZodNumber`; `type`: `ZodLiteral`\<`"FOREST"`\>; \}, `$strip`\>\], `"type"`\>; `source`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>, `ZodObject`\<\{ `cohort`: `ZodString`; `count`: `ZodNumber`; `kind`: `ZodLiteral`\<`"TOKEN"`\>; \}, `$strip`\>\], `"kind"`\>

A card's face: a live miniature of the output it represents, rendered from
this data rather than from an illustration.

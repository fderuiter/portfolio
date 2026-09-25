[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / FigurePlotSchema

# Variable: FigurePlotSchema

> `const` **FigurePlotSchema**: `ZodDiscriminatedUnion`\<\[`ZodObject`\<\{ `series`: `ZodArray`\<`ZodObject`\<\{ `censors`: `ZodOptional`\<`ZodArray`\<`ZodNumber`\>\>; `label`: `ZodString`; `points`: `ZodArray`\<`ZodTuple`\<\[`ZodNumber`, `ZodNumber`\], `null`\>\>; \}, `$strip`\>\>; `type`: `ZodLiteral`\<`"KM"`\>; \}, `$strip`\>, `ZodObject`\<\{ `series`: `ZodArray`\<`ZodObject`\<\{ `censors`: `ZodOptional`\<`ZodArray`\<`ZodNumber`\>\>; `label`: `ZodString`; `points`: `ZodArray`\<`ZodTuple`\<\[`ZodNumber`, `ZodNumber`\], `null`\>\>; \}, `$strip`\>\>; `type`: `ZodLiteral`\<`"SPARKLINE"`\>; \}, `$strip`\>, `ZodObject`\<\{ `intervals`: `ZodArray`\<`ZodObject`\<\{ `estimate`: `ZodNumber`; `label`: `ZodString`; `lower`: `ZodNumber`; `upper`: `ZodNumber`; \}, `$strip`\>\>; `reference`: `ZodNumber`; `type`: `ZodLiteral`\<`"FOREST"`\>; \}, `$strip`\>\], `"type"`\>

What a Figure face plots.

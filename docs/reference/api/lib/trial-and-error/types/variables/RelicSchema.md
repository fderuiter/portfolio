[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / RelicSchema

# Variable: RelicSchema

> `const` **RelicSchema**: `ZodObject`\<\{ `description`: `ZodString`; `id`: `ZodString`; `modifier`: `ZodObject`\<\{ `chips`: `ZodNumber`; `label`: `ZodString`; `plusMult`: `ZodNumber`; `sourceId`: `ZodString`; `xMult`: `ZodNumber`; \}, `$strip`\>; `name`: `ZodString`; \}, `$strip`\>

An SOP relic: a standing score modifier the run keeps once earned. It
joins every later hand's scoring as a `ScoreModifier`.

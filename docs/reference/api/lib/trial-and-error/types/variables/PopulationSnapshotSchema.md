[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / PopulationSnapshotSchema

# Variable: PopulationSnapshotSchema

> `const` **PopulationSnapshotSchema**: `ZodObject`\<\{ `capturedAt`: `ZodISODateTime`; `id`: `ZodString`; `subjects`: `ZodArray`\<`ZodObject`\<\{ `age`: `ZodNumber`; `arm`: `ZodEnum`\<\{ `ACTIVE`: `"ACTIVE"`; `PLACEBO`: `"PLACEBO"`; \}\>; `id`: `ZodString`; `populations`: `ZodArray`\<`ZodEnum`\<\{ `FAS`: `"FAS"`; `ITT`: `"ITT"`; `PER_PROTOCOL`: `"PER_PROTOCOL"`; `SAFETY`: `"SAFETY"`; `SCREENED`: `"SCREENED"`; \}\>\>; `sex`: `ZodEnum`\<\{ `F`: `"F"`; `M`: `"M"`; \}\>; \}, `$strip`\>\>; `version`: `ZodNumber`; \}, `$strip`\>

An immutable, versioned record of population membership.

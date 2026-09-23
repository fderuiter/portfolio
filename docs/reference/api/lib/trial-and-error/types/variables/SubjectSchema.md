[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / SubjectSchema

# Variable: SubjectSchema

> `const` **SubjectSchema**: `ZodObject`\<\{ `age`: `ZodNumber`; `arm`: `ZodEnum`\<\{ `ACTIVE`: `"ACTIVE"`; `PLACEBO`: `"PLACEBO"`; \}\>; `id`: `ZodString`; `populations`: `ZodArray`\<`ZodEnum`\<\{ `FAS`: `"FAS"`; `ITT`: `"ITT"`; `PER_PROTOCOL`: `"PER_PROTOCOL"`; `SAFETY`: `"SAFETY"`; `SCREENED`: `"SCREENED"`; \}\>\>; `sex`: `ZodEnum`\<\{ `F`: `"F"`; `M`: `"M"`; \}\>; \}, `$strip`\>

A fictional subject data token and the populations it belongs to.

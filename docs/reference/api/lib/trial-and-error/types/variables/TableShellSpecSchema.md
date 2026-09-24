[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / TableShellSpecSchema

# Variable: TableShellSpecSchema

> `const` **TableShellSpecSchema**: `ZodObject`\<\{ `allowedFootnoteSlots`: `ZodNumber`; `cardType`: `ZodEnum`\<\{ `FIGURE`: `"FIGURE"`; `LISTING`: `"LISTING"`; `SUBJECT_TOKEN`: `"SUBJECT_TOKEN"`; `TABLE`: `"TABLE"`; \}\>; `chips`: `ZodNumber`; `compatiblePopulations`: `ZodOptional`\<`ZodArray`\<`ZodEnum`\<\{ `FAS`: `"FAS"`; `ITT`: `"ITT"`; `PER_PROTOCOL`: `"PER_PROTOCOL"`; `SAFETY`: `"SAFETY"`; `SCREENED`: `"SCREENED"`; \}\>\>\>; `id`: `ZodString`; `isBlinded`: `ZodOptional`\<`ZodBoolean`\>; `layout`: `ZodOptional`\<`ZodObject`\<\{ `columns`: `ZodArray`\<`ZodObject`\<\{ `arm`: `ZodEnum`\<\{ `ACTIVE`: `"ACTIVE"`; `PLACEBO`: `"PLACEBO"`; `TOTAL`: `"TOTAL"`; \}\>; `id`: `ZodString`; `label`: `ZodString`; \}, `$strip`\>\>; `rows`: `ZodArray`\<`ZodObject`\<\{ `id`: `ZodString`; `label`: `ZodString`; `statistic`: `ZodDiscriminatedUnion`\<\[`ZodObject`\<..., ...\>, `ZodObject`\<..., ...\>, `ZodObject`\<..., ...\>, `ZodObject`\<..., ...\>, `ZodObject`\<..., ...\>\], `"kind"`\>; \}, `$strip`\>\>; \}, `$strip`\>\>; `mult`: `ZodNumber`; `requiredRulebookId`: `ZodString`; `tableNumber`: `ZodString`; `targetPopulation`: `ZodEnum`\<\{ `FAS`: `"FAS"`; `ITT`: `"ITT"`; `PER_PROTOCOL`: `"PER_PROTOCOL"`; `SAFETY`: `"SAFETY"`; `SCREENED`: `"SCREENED"`; \}\>; `title`: `ZodString`; \}, `$strip`\>

A planned output (Table, Listing or Figure) and its scoring weight.

`compatiblePopulations` lists the analysis sets the SAP allows this shell
to be run on; without it, only `targetPopulation`. `layout` is the shell's
columns and row statistics, which a blank shell needs so it can be
compiled once the player allocates an analysis set to it.

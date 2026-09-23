[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / StagedTableSchema

# Variable: StagedTableSchema

> `const` **StagedTableSchema**: `ZodObject`\<\{ `cells`: `ZodArray`\<`ZodArray`\<`ZodString`\>\>; `columns`: `ZodArray`\<`ZodObject`\<\{ `arm`: `ZodEnum`\<\{ `ACTIVE`: `"ACTIVE"`; `PLACEBO`: `"PLACEBO"`; `TOTAL`: `"TOTAL"`; \}\>; `id`: `ZodString`; `label`: `ZodString`; \}, `$strip`\>\>; `draftLabel`: `ZodString`; `id`: `ZodString`; `populationSnapshotId`: `ZodString`; `rows`: `ZodArray`\<`ZodObject`\<\{ `id`: `ZodString`; `label`: `ZodString`; `statistic`: `ZodDiscriminatedUnion`\<\[`ZodObject`\<\{ `kind`: `ZodLiteral`\<`"POPULATION_N"`\>; \}, `$strip`\>, `ZodObject`\<\{ `kind`: `ZodLiteral`\<`"MEAN_AGE"`\>; \}, `$strip`\>, `ZodObject`\<\{ `kind`: `ZodLiteral`\<`"SEX_COUNT_PCT"`\>; `sex`: `ZodEnum`\<\{ `F`: ...; `M`: ...; \}\>; \}, `$strip`\>, `ZodObject`\<\{ `kind`: `ZodLiteral`\<`"AGE_AT_LEAST_COUNT_PCT"`\>; `minAge`: `ZodNumber`; \}, `$strip`\>\], `"kind"`\>; \}, `$strip`\>\>; `shellId`: `ZodString`; \}, `$strip`\>

A staged output card: the displayed cells a reviewer checks.

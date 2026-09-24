[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / RowStatisticSchema

# Variable: RowStatisticSchema

> `const` **RowStatisticSchema**: `ZodDiscriminatedUnion`\<\[`ZodObject`\<\{ `kind`: `ZodLiteral`\<`"POPULATION_N"`\>; \}, `$strip`\>, `ZodObject`\<\{ `kind`: `ZodLiteral`\<`"MEAN_AGE"`\>; \}, `$strip`\>, `ZodObject`\<\{ `kind`: `ZodLiteral`\<`"SEX_COUNT_PCT"`\>; `sex`: `ZodEnum`\<\{ `F`: `"F"`; `M`: `"M"`; \}\>; \}, `$strip`\>, `ZodObject`\<\{ `kind`: `ZodLiteral`\<`"AGE_AT_LEAST_COUNT_PCT"`\>; `minAge`: `ZodNumber`; \}, `$strip`\>, `ZodObject`\<\{ `kind`: `ZodLiteral`\<`"AE_SUBJECT_COUNT_PCT"`\>; `ledToDiscontinuation`: `ZodOptional`\<`ZodLiteral`\<`true`\>\>; `minGrade`: `ZodOptional`\<`ZodNumber`\>; `serious`: `ZodOptional`\<`ZodLiteral`\<`true`\>\>; `soc`: `ZodOptional`\<`ZodString`\>; `term`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>\], `"kind"`\>

The statistic a table row reports, re-derivable from the snapshot.

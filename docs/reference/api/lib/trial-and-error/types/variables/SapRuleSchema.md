[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / SapRuleSchema

# Variable: SapRuleSchema

> `const` **SapRuleSchema**: `ZodObject`\<\{ `category`: `ZodEnum`\<\{ `DENOMINATOR`: `"DENOMINATOR"`; `PRECISION`: `"PRECISION"`; `ROUNDING`: `"ROUNDING"`; `VALUE`: `"VALUE"`; \}\>; `consequence`: `ZodString`; `correctionMultBonus`: `ZodNumber`; `id`: `ZodString`; `redlineMultPenalty`: `ZodNumber`; `severity`: `ZodEnum`\<\{ `FATAL`: `"FATAL"`; `MAJOR`: `"MAJOR"`; `MINOR`: `"MINOR"`; \}\>; `statement`: `ZodString`; `waivableBy`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; \}, `$strip`\>

One SAP rule, with the scoring effect of breaking or fixing it.

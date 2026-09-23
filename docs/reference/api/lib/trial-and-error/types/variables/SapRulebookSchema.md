[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / SapRulebookSchema

# Variable: SapRulebookSchema

> `const` **SapRulebookSchema**: `ZodObject`\<\{ `id`: `ZodString`; `meanPrecision`: `ZodNumber`; `percentPrecision`: `ZodNumber`; `populationAliases`: `ZodArray`\<`ZodObject`\<\{ `equals`: `ZodEnum`\<\{ `FAS`: `"FAS"`; `ITT`: `"ITT"`; `PER_PROTOCOL`: `"PER_PROTOCOL"`; `SAFETY`: `"SAFETY"`; `SCREENED`: `"SCREENED"`; \}\>; `population`: `ZodEnum`\<\{ `FAS`: `"FAS"`; `ITT`: `"ITT"`; `PER_PROTOCOL`: `"PER_PROTOCOL"`; `SAFETY`: `"SAFETY"`; `SCREENED`: `"SCREENED"`; \}\>; \}, `$strip`\>\>; `populationSuit`: `ZodEnum`\<\{ `FAS`: `"FAS"`; `ITT`: `"ITT"`; `PER_PROTOCOL`: `"PER_PROTOCOL"`; `SAFETY`: `"SAFETY"`; `SCREENED`: `"SCREENED"`; \}\>; `roundingMode`: `ZodEnum`\<\{ `HALF_AWAY_FROM_ZERO`: `"HALF_AWAY_FROM_ZERO"`; `HALF_EVEN`: `"HALF_EVEN"`; `TRUNCATE`: `"TRUNCATE"`; \}\>; `rules`: `ZodArray`\<`ZodObject`\<\{ `category`: `ZodEnum`\<\{ `DENOMINATOR`: `"DENOMINATOR"`; `PRECISION`: `"PRECISION"`; `ROUNDING`: `"ROUNDING"`; `VALUE`: `"VALUE"`; \}\>; `consequence`: `ZodString`; `correctionMultBonus`: `ZodNumber`; `id`: `ZodString`; `redlineMultPenalty`: `ZodNumber`; `severity`: `ZodEnum`\<\{ `FATAL`: `"FATAL"`; `MAJOR`: `"MAJOR"`; `MINOR`: `"MINOR"`; \}\>; `statement`: `ZodString`; \}, `$strip`\>\>; `title`: `ZodString`; \}, `$strip`\>

A Statistical Analysis Plan rulebook: the population suit, precision and
rounding convention a scenario's outputs are validated against.

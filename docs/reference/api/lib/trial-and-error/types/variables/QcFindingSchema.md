[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / QcFindingSchema

# Variable: QcFindingSchema

> `const` **QcFindingSchema**: `ZodObject`\<\{ `category`: `ZodEnum`\<\{ `DENOMINATOR`: `"DENOMINATOR"`; `PRECISION`: `"PRECISION"`; `ROUNDING`: `"ROUNDING"`; `VALUE`: `"VALUE"`; \}\>; `cell`: `ZodObject`\<\{ `col`: `ZodNumber`; `row`: `ZodNumber`; \}, `$strip`\>; `consequence`: `ZodString`; `evidence`: `ZodString`; `expected`: `ZodString`; `id`: `ZodString`; `observed`: `ZodString`; `rule`: `ZodString`; `ruleId`: `ZodString`; `severity`: `ZodEnum`\<\{ `FATAL`: `"FATAL"`; `MAJOR`: `"MAJOR"`; `MINOR`: `"MINOR"`; \}\>; \}, `$strip`\>

One validator finding, explained for the reviewer.

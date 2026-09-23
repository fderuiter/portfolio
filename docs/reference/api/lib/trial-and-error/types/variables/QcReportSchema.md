[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / QcReportSchema

# Variable: QcReportSchema

> `const` **QcReportSchema**: `ZodObject`\<\{ `findings`: `ZodArray`\<`ZodObject`\<\{ `category`: `ZodEnum`\<\{ `DENOMINATOR`: `"DENOMINATOR"`; `PRECISION`: `"PRECISION"`; `ROUNDING`: `"ROUNDING"`; `VALUE`: `"VALUE"`; \}\>; `cell`: `ZodObject`\<\{ `col`: `ZodNumber`; `row`: `ZodNumber`; \}, `$strip`\>; `consequence`: `ZodString`; `evidence`: `ZodString`; `expected`: `ZodString`; `id`: `ZodString`; `observed`: `ZodString`; `rule`: `ZodString`; `ruleId`: `ZodString`; `severity`: `ZodEnum`\<\{ `FATAL`: `"FATAL"`; `MAJOR`: `"MAJOR"`; `MINOR`: `"MINOR"`; \}\>; \}, `$strip`\>\>; `populationN`: `ZodNumber`; `populationSnapshotId`: `ZodString`; `rulebookId`: `ZodString`; `tableId`: `ZodString`; \}, `$strip`\>

The validator's complete, stably ordered output for one staged table.

[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/schemas](../README.md) / MaintenancePhaseSummarySchema

# Variable: MaintenancePhaseSummarySchema

> `const` **MaintenancePhaseSummarySchema**: `ZodObject`\<\{ `counts`: `ZodRecord`\<`ZodString`, `ZodNullable`\<`ZodNumber`\>\>; `durationMs`: `ZodNumber`; `error`: `ZodOptional`\<`ZodString`\>; `status`: `ZodEnum`\<\{ `completed`: `"completed"`; `failed`: `"failed"`; `skipped`: `"skipped"`; `timed_out`: `"timed_out"`; \}\>; \}, `$strip`\>

Schema for individual maintenance phase summary counters

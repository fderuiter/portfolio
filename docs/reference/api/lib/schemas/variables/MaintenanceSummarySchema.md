[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/schemas](../README.md) / MaintenanceSummarySchema

# Variable: MaintenanceSummarySchema

> `const` **MaintenanceSummarySchema**: `ZodObject`\<\{ `completedAt`: `ZodString`; `deadlineMs`: `ZodNumber`; `durationMs`: `ZodNumber`; `partial`: `ZodBoolean`; `phases`: `ZodRecord`\<`ZodString`, `ZodObject`\<\{ `counts`: `ZodRecord`\<`ZodString`, `ZodNullable`\<`ZodNumber`\>\>; `durationMs`: `ZodNumber`; `error`: `ZodOptional`\<`ZodString`\>; `status`: `ZodEnum`\<\{ `completed`: `"completed"`; `failed`: `"failed"`; `skipped`: `"skipped"`; `timed_out`: `"timed_out"`; \}\>; \}, `$strip`\>\>; `startedAt`: `ZodString`; `success`: `ZodBoolean`; \}, `$strip`\>

Schema for maintenance execution pipeline summary

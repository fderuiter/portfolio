[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/universal-schema](../README.md) / UniversalCrfVisitSchema

# Variable: UniversalCrfVisitSchema

> `const` **UniversalCrfVisitSchema**: `ZodObject`\<\{ `assignedFormIds`: `ZodDefault`\<`ZodArray`\<`ZodString`\>\>; `id`: `ZodString`; `isRepeating`: `ZodOptional`\<`ZodBoolean`\>; `name`: `ZodString`; `oid`: `ZodString`; `repeatMax`: `ZodOptional`\<`ZodNumber`\>; `targetDay`: `ZodDefault`\<`ZodNumber`\>; `visitType`: `ZodDefault`\<`ZodEnum`\<\{ `Common`: `"Common"`; `Scheduled`: `"Scheduled"`; `Unscheduled`: `"Unscheduled"`; \}\>\>; `windowAfter`: `ZodDefault`\<`ZodNumber`\>; `windowBefore`: `ZodDefault`\<`ZodNumber`\>; \}, `$strip`\>

Defined in: [lib/crf/universal-schema.ts:149](https://github.com/fderuiter/portfolio/blob/main/lib/crf/universal-schema.ts#L149)

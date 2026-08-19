[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/universal-schema](../README.md) / UniversalCrfVisitSchema

# Variable: UniversalCrfVisitSchema

> `const` **UniversalCrfVisitSchema**: `ZodObject`\<\{ `assignedFormIds`: `ZodDefault`\<`ZodArray`\<`ZodString`\>\>; `formIds`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `id`: `ZodString`; `isRepeating`: `ZodOptional`\<`ZodBoolean`\>; `name`: `ZodString`; `oid`: `ZodOptional`\<`ZodString`\>; `repeatMax`: `ZodOptional`\<`ZodNumber`\>; `targetDay`: `ZodDefault`\<`ZodNumber`\>; `timepointDays`: `ZodOptional`\<`ZodNumber`\>; `visitType`: `ZodDefault`\<`ZodEnum`\<\{ `Common`: `"Common"`; `Scheduled`: `"Scheduled"`; `Unscheduled`: `"Unscheduled"`; \}\>\>; `windowAfter`: `ZodDefault`\<`ZodNumber`\>; `windowBefore`: `ZodDefault`\<`ZodNumber`\>; \}, `$strip`\>

Defined in: [lib/crf/universal-schema.ts:157](https://github.com/fderuiter/portfolio/blob/main/lib/crf/universal-schema.ts#L157)

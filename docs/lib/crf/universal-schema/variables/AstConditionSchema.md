[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/universal-schema](../README.md) / AstConditionSchema

# Variable: AstConditionSchema

> `const` **AstConditionSchema**: `ZodObject`\<\{ `crossVisitId`: `ZodOptional`\<`ZodString`\>; `fieldId`: `ZodString`; `operator`: `ZodEnum`\<\{ `contains`: `"contains"`; `eq`: `"eq"`; `gt`: `"gt"`; `gte`: `"gte"`; `in`: `"in"`; `is_empty`: `"is_empty"`; `is_not_empty`: `"is_not_empty"`; `lt`: `"lt"`; `lte`: `"lte"`; `neq`: `"neq"`; \}\>; `value`: `ZodUnion`\<readonly \[`ZodString`, `ZodNumber`, `ZodBoolean`, `ZodArray`\<`ZodString`\>\]\>; \}, `$strip`\>

Defined in: [lib/crf/universal-schema.ts:64](https://github.com/fderuiter/portfolio/blob/main/lib/crf/universal-schema.ts#L64)

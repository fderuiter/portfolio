[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/universal-schema](../README.md) / EditCheckRuleSchema

# Variable: EditCheckRuleSchema

> `const` **EditCheckRuleSchema**: `ZodObject`\<\{ `actionType`: `ZodEnum`\<\{ `hide_field`: `"hide_field"`; `raise_query`: `"raise_query"`; `require_field`: `"require_field"`; `set_value`: `"set_value"`; `show_field`: `"show_field"`; \}\>; `conditions`: `ZodArray`\<`ZodObject`\<\{ `crossVisitId`: `ZodOptional`\<`ZodString`\>; `fieldId`: `ZodString`; `operator`: `ZodEnum`\<\{ `contains`: `"contains"`; `eq`: `"eq"`; `gt`: `"gt"`; `gte`: `"gte"`; `in`: `"in"`; `is_empty`: `"is_empty"`; `is_not_empty`: `"is_not_empty"`; `lt`: `"lt"`; `lte`: `"lte"`; `neq`: `"neq"`; \}\>; `value`: `ZodUnion`\<readonly \[`ZodString`, `ZodNumber`, `ZodBoolean`, `ZodArray`\<`ZodString`\>\]\>; \}, `$strip`\>\>; `description`: `ZodDefault`\<`ZodString`\>; `formulaExpression`: `ZodOptional`\<`ZodString`\>; `id`: `ZodString`; `logicalOperator`: `ZodDefault`\<`ZodEnum`\<\{ `AND`: `"AND"`; `OR`: `"OR"`; \}\>\>; `name`: `ZodString`; `queryMessage`: `ZodOptional`\<`ZodString`\>; `querySeverity`: `ZodOptional`\<`ZodEnum`\<\{ `error`: `"error"`; `info`: `"info"`; `warning`: `"warning"`; \}\>\>; `targetFieldId`: `ZodString`; `triggerFieldIds`: `ZodArray`\<`ZodString`\>; \}, `$strip`\>

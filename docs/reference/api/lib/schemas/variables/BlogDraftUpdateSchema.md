[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/schemas](../README.md) / BlogDraftUpdateSchema

# Variable: BlogDraftUpdateSchema

> `const` **BlogDraftUpdateSchema**: `ZodObject`\<\{ `body`: `ZodOptional`\<`ZodString`\>; `dek`: `ZodOptional`\<`ZodString`\>; `heroImageUrl`: `ZodOptional`\<`ZodNullable`\<`ZodString`\>\>; `pillar`: `ZodOptional`\<`ZodEnum`\<\{ `accessibility-engineering`: `"accessibility-engineering"`; `agent-first-dx`: `"agent-first-dx"`; `browser-graphics-engineering`: `"browser-graphics-engineering"`; `clinical-data-engineering`: `"clinical-data-engineering"`; `field-notes`: `"field-notes"`; `formal-verification`: `"formal-verification"`; \}\>\>; `slug`: `ZodOptional`\<`ZodString`\>; `tags`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `title`: `ZodOptional`\<`ZodString`\>; \}, `$strict`\>

Runtime contract for a partial, server-owned BlogPost draft edit. Publication,
identity, and timestamp fields are intentionally omitted and rejected by strict mode.

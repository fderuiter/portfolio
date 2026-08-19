[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/universal-schema](../README.md) / CodelistDefinitionSchema

# Variable: CodelistDefinitionSchema

> `const` **CodelistDefinitionSchema**: `ZodObject`\<\{ `id`: `ZodString`; `isStandard`: `ZodOptional`\<`ZodBoolean`\>; `name`: `ZodString`; `nciCodelistCode`: `ZodOptional`\<`ZodString`\>; `options`: `ZodDefault`\<`ZodArray`\<`ZodObject`\<\{ `code`: `ZodString`; `label`: `ZodString`; `nciCode`: `ZodOptional`\<`ZodString`\>; `order`: `ZodDefault`\<`ZodNumber`\>; \}, `$strip`\>\>\>; \}, `$strip`\>

Defined in: [lib/crf/universal-schema.ts:42](https://github.com/fderuiter/portfolio/blob/main/lib/crf/universal-schema.ts#L42)

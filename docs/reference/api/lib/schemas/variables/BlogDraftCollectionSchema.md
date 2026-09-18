[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/schemas](../README.md) / BlogDraftCollectionSchema

# Variable: BlogDraftCollectionSchema

> `const` **BlogDraftCollectionSchema**: `ZodObject`\<\{ `data`: `ZodArray`\<`ZodObject`\<\{ `body`: `ZodString`; `created_at`: `ZodString`; `dek`: `ZodString`; `hero_image_url`: `ZodOptional`\<`ZodNullable`\<`ZodString`\>\>; `id`: `ZodString`; `pillar`: `ZodString`; `published`: `ZodLiteral`\<`false`\>; `reading_time_minutes`: `ZodOptional`\<`ZodNullable`\<`ZodNumber`\>\>; `slug`: `ZodString`; `tags`: `ZodString`; `title`: `ZodString`; `updated_at`: `ZodString`; \}, `$strip`\>\>; `pagination`: `ZodObject`\<\{ `page`: `ZodNumber`; `pageSize`: `ZodNumber`; `total`: `ZodNumber`; \}, `$strip`\>; \}, `$strip`\>

Schema for paginated BlogDraft collection

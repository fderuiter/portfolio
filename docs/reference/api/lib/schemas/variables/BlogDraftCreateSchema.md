[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/schemas](../README.md) / BlogDraftCreateSchema

# Variable: BlogDraftCreateSchema

> `const` **BlogDraftCreateSchema**: `ZodPipe`\<`ZodObject`\<\{ `body`: `ZodString`; `dek`: `ZodString`; `heroImageUrl`: `ZodOptional`\<`ZodNullable`\<`ZodString`\>\>; `pillar`: `ZodEnum`\<\{ `accessibility-engineering`: `"accessibility-engineering"`; `agent-first-dx`: `"agent-first-dx"`; `browser-graphics-engineering`: `"browser-graphics-engineering"`; `clinical-data-engineering`: `"clinical-data-engineering"`; `field-notes`: `"field-notes"`; `formal-verification`: `"formal-verification"`; \}\>; `slug`: `ZodString`; `tags`: `ZodArray`\<`ZodString`\>; `title`: `ZodString`; \}, `$strict`\>, `ZodTransform`\<\{ `body`: `string`; `dek`: `string`; `hero_image_url`: `string` \| `null`; `heroImageUrl?`: `string` \| `null`; `pillar`: `"clinical-data-engineering"` \| `"formal-verification"` \| `"accessibility-engineering"` \| `"browser-graphics-engineering"` \| `"agent-first-dx"` \| `"field-notes"`; `slug`: `string`; `tags`: `string`; `title`: `string`; \}, \{ `body`: `string`; `dek`: `string`; `heroImageUrl?`: `string` \| `null`; `pillar`: `"clinical-data-engineering"` \| `"formal-verification"` \| `"accessibility-engineering"` \| `"browser-graphics-engineering"` \| `"agent-first-dx"` \| `"field-notes"`; `slug`: `string`; `tags`: `string`[]; `title`: `string`; \}\>\>

Runtime contract for a new, server-owned unpublished BlogPost draft.

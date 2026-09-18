[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/schemas](../README.md) / CaseStudySubmissionSchema

# Variable: CaseStudySubmissionSchema

> `const` **CaseStudySubmissionSchema**: `ZodPipe`\<`ZodObject`\<\{ `architectural_narrative`: `ZodOptional`\<`ZodString`\>; `architectural_narrative_html`: `ZodOptional`\<`ZodString`\>; `editorial_content`: `ZodOptional`\<`ZodString`\>; `github_url`: `ZodOptional`\<`ZodString`\>; `hero_image_url`: `ZodOptional`\<`ZodNullable`\<`ZodString`\>\>; `heroImageUrl`: `ZodOptional`\<`ZodNullable`\<`ZodString`\>\>; `language`: `ZodOptional`\<`ZodString`\>; `narrative`: `ZodOptional`\<`ZodString`\>; `primary_language`: `ZodOptional`\<`ZodString`\>; `slug`: `ZodString`; `summary`: `ZodOptional`\<`ZodString`\>; `summary_markdown`: `ZodOptional`\<`ZodString`\>; `tags`: `ZodUnion`\<readonly \[`ZodString`, `ZodArray`\<`ZodString`\>\]\>; `title`: `ZodString`; \}, `$strip`\>, `ZodTransform`\<\{ `architectural_narrative`: `string`; `editorial_content`: `string`; `github_url`: `string` \| `null`; `primary_language`: `string`; `slug`: `string`; `tags`: `string`; `title`: `string`; \}, \{ `architectural_narrative?`: `string`; `architectural_narrative_html?`: `string`; `editorial_content?`: `string`; `github_url?`: `string`; `hero_image_url?`: `string` \| `null`; `heroImageUrl?`: `string` \| `null`; `language?`: `string`; `narrative?`: `string`; `primary_language?`: `string`; `slug`: `string`; `summary?`: `string`; `summary_markdown?`: `string`; `tags`: `string` \| `string`[]; `title`: `string`; \}\>\>

Schema for Case Study submission POST payload validation

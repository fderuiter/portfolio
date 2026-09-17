[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/schemas](../README.md) / FeedbackGetResponseSchema

# Variable: FeedbackGetResponseSchema

> `const` **FeedbackGetResponseSchema**: `ZodObject`\<\{ `caseStudySlug`: `ZodString`; `feedback`: `ZodArray`\<`ZodObject`\<\{ `comments`: `ZodString`; `createdAt`: `ZodString`; `id`: `ZodString`; `takeaways`: `ZodArray`\<`ZodString`\>; \}, `$strip`\>\>; `hasSubmitted`: `ZodBoolean`; `success`: `ZodBoolean`; `totalFeedback`: `ZodNumber`; \}, `$strip`\>

Schema for Feedback GET response

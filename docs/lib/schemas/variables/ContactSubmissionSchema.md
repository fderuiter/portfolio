[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/schemas](../README.md) / ContactSubmissionSchema

# Variable: ContactSubmissionSchema

> `const` **ContactSubmissionSchema**: `ZodObject`\<\{ `_clientTimestamp`: `ZodOptional`\<`ZodNumber`\>; `_gotcha`: `ZodOptional`\<`ZodString`\>; `email`: `ZodString`; `intent`: `ZodDefault`\<`ZodEnum`\<\{ `collaboration`: `"collaboration"`; `consulting`: `"consulting"`; `general`: `"general"`; `other`: `"other"`; `recruiting`: `"recruiting"`; \}\>\>; `message`: `ZodString`; `name`: `ZodString`; `subject`: `ZodString`; \}, `$strip`\>

Defined in: [lib/schemas.ts:240](https://github.com/fderuiter/portfolio/blob/main/lib/schemas.ts#L240)

Schema for Contact submission POST payload validation

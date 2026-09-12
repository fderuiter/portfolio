[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/schemas](../README.md) / ContactSubmissionSchema

# Variable: ContactSubmissionSchema

> `const` **ContactSubmissionSchema**: `ZodObject`\<\{ `_clientTimestamp`: `ZodOptional`\<`ZodNumber`\>; `_gotcha`: `ZodOptional`\<`ZodString`\>; `email`: `ZodString`; `intent`: `ZodDefault`\<`ZodEnum`\<\{ `collaboration`: `"collaboration"`; `consulting`: `"consulting"`; `general`: `"general"`; `other`: `"other"`; `recruiting`: `"recruiting"`; \}\>\>; `message`: `ZodString`; `name`: `ZodString`; `subject`: `ZodString`; \}, `$strip`\>

Schema for Contact submission POST payload validation

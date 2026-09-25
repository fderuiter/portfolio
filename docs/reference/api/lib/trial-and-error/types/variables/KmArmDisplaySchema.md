[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / KmArmDisplaySchema

# Variable: KmArmDisplaySchema

> `const` **KmArmDisplaySchema**: `ZodObject`\<\{ `arm`: `ZodEnum`\<\{ `ACTIVE`: `"ACTIVE"`; `PLACEBO`: `"PLACEBO"`; \}\>; `atRisk`: `ZodArray`\<`ZodNumber`\>; `censorTicks`: `ZodArray`\<`ZodNumber`\>; `curve`: `ZodArray`\<`ZodTuple`\<\[`ZodNumber`, `ZodNumber`\], `null`\>\>; \}, `$strip`\>

What a KM figure draft prints for one arm: the curve, ticks and at-risk row.

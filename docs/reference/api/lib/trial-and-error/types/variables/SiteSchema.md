[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / SiteSchema

# Variable: SiteSchema

> `const` **SiteSchema**: `ZodObject`\<\{ `description`: `ZodString`; `id`: `ZodString`; `modifier`: `ZodObject`\<\{ `chips`: `ZodNumber`; `label`: `ZodString`; `plusMult`: `ZodNumber`; `sourceId`: `ZodString`; `xMult`: `ZodNumber`; \}, `$strip`\>; `name`: `ZodString`; `subjects`: `ZodArray`\<`ZodObject`\<\{ `adverseEvents`: `ZodOptional`\<`ZodArray`\<`ZodObject`\<\{ `grade`: `ZodNumber`; `ledToDiscontinuation`: `ZodBoolean`; `serious`: `ZodBoolean`; `soc`: `ZodString`; `term`: `ZodString`; \}, `$strip`\>\>\>; `age`: `ZodNumber`; `arm`: `ZodEnum`\<\{ `ACTIVE`: `"ACTIVE"`; `PLACEBO`: `"PLACEBO"`; \}\>; `id`: `ZodString`; `populations`: `ZodArray`\<`ZodEnum`\<\{ `FAS`: `"FAS"`; `ITT`: `"ITT"`; `PER_PROTOCOL`: `"PER_PROTOCOL"`; `SAFETY`: `"SAFETY"`; `SCREENED`: `"SCREENED"`; \}\>\>; `sex`: `ZodEnum`\<\{ `F`: `"F"`; `M`: `"M"`; \}\>; \}, `$strip`\>\>; \}, `$strip`\>

A trial site a Site Activation pack can activate (#948). Activating
it adds its standing Chips to every later hand and enrolls its subjects
into the study after the next Blind's first hand, which versions the
population snapshot and stales the outputs in hand that depend on it.

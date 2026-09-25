[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / CrisisCardSchema

# Variable: CrisisCardSchema

> `const` **CrisisCardSchema**: `ZodObject`\<\{ `choices`: `ZodArray`\<`ZodObject`\<\{ `consequence`: `ZodString`; `effect`: `ZodObject`\<\{ `budget`: `ZodOptional`\<`ZodNumber`\>; `cpu`: `ZodOptional`\<`ZodNumber`\>; `grantSeal`: `ZodOptional`\<`ZodObject`\<\{ `effect`: `ZodDiscriminatedUnion`\<..., ...\>; `eligible`: `ZodObject`\<..., ...\>; `footnote`: `ZodString`; `id`: `ZodString`; `name`: `ZodString`; `sellValue`: `ZodNumber`; \}, `$strip`\>\>; `modifier`: `ZodOptional`\<`ZodObject`\<\{ `debuffType`: `ZodEnum`\<...\>; `description`: `ZodString`; `disabledPopulations`: `ZodOptional`\<...\>; `discardCpuPenalty`: `ZodOptional`\<...\>; `id`: `ZodString`; `maxHandsAllowed`: `ZodOptional`\<...\>; `name`: `ZodString`; \}, `$strip`\>\>; `spendSeal`: `ZodOptional`\<`ZodLiteral`\<`true`\>\>; `transition`: `ZodOptional`\<`ZodObject`\<\{ `change`: `ZodEnum`\<...\>; `description`: `ZodString`; `effectiveAt`: `ZodISODateTime`; `id`: `ZodString`; `populations`: `ZodArray`\<...\>; `reason`: `ZodEnum`\<...\>; `subject`: `ZodOptional`\<...\>; `subjectId`: `ZodString`; \}, `$strip`\>\>; \}, `$strip`\>; `id`: `ZodString`; `label`: `ZodString`; \}, `$strip`\>\>; `description`: `ZodString`; `id`: `ZodString`; `name`: `ZodString`; \}, `$strip`\>

A crisis card: something that happens to a study (a dropout, an
amendment, an audit, a migration). It is drawn by the seeded event draw
when a Blind starts and must be answered before the Blind is played. At
least one choice is free, so a crisis can never strand a run.

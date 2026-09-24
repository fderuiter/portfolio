[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / StudyEventSchema

# Variable: StudyEventSchema

> `const` **StudyEventSchema**: `ZodObject`\<\{ `afterHands`: `ZodNumber`; `transition`: `ZodObject`\<\{ `change`: `ZodEnum`\<\{ `JOIN`: `"JOIN"`; `LEAVE`: `"LEAVE"`; \}\>; `description`: `ZodString`; `effectiveAt`: `ZodISODateTime`; `id`: `ZodString`; `populations`: `ZodArray`\<`ZodEnum`\<\{ `FAS`: `"FAS"`; `ITT`: `"ITT"`; `PER_PROTOCOL`: `"PER_PROTOCOL"`; `SAFETY`: `"SAFETY"`; `SCREENED`: `"SCREENED"`; \}\>\>; `reason`: `ZodEnum`\<\{ `DROPOUT`: `"DROPOUT"`; `PROTOCOL_AMENDMENT`: `"PROTOCOL_AMENDMENT"`; `PROTOCOL_DEVIATION`: `"PROTOCOL_DEVIATION"`; `SCREEN_FAILURE`: `"SCREEN_FAILURE"`; \}\>; `subjectId`: `ZodString`; \}, `$strip`\>; \}, `$strip`\>

A scripted study event: a transition applied after a given hand.

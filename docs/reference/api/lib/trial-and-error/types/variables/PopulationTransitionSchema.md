[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / PopulationTransitionSchema

# Variable: PopulationTransitionSchema

> `const` **PopulationTransitionSchema**: `ZodObject`\<\{ `change`: `ZodEnum`\<\{ `ENROLL`: `"ENROLL"`; `JOIN`: `"JOIN"`; `LEAVE`: `"LEAVE"`; \}\>; `description`: `ZodString`; `effectiveAt`: `ZodISODateTime`; `id`: `ZodString`; `populations`: `ZodArray`\<`ZodEnum`\<\{ `FAS`: `"FAS"`; `ITT`: `"ITT"`; `PER_PROTOCOL`: `"PER_PROTOCOL"`; `SAFETY`: `"SAFETY"`; `SCREENED`: `"SCREENED"`; \}\>\>; `reason`: `ZodEnum`\<\{ `DROPOUT`: `"DROPOUT"`; `PROTOCOL_AMENDMENT`: `"PROTOCOL_AMENDMENT"`; `PROTOCOL_DEVIATION`: `"PROTOCOL_DEVIATION"`; `SCREEN_FAILURE`: `"SCREEN_FAILURE"`; `SITE_ACTIVATION`: `"SITE_ACTIVATION"`; \}\>; `subject`: `ZodOptional`\<`ZodObject`\<\{ `adverseEvents`: `ZodOptional`\<`ZodArray`\<`ZodObject`\<\{ `grade`: `ZodNumber`; `ledToDiscontinuation`: `ZodBoolean`; `serious`: `ZodBoolean`; `soc`: `ZodString`; `term`: `ZodString`; \}, `$strip`\>\>\>; `age`: `ZodNumber`; `arm`: `ZodEnum`\<\{ `ACTIVE`: `"ACTIVE"`; `PLACEBO`: `"PLACEBO"`; \}\>; `id`: `ZodString`; `populations`: `ZodArray`\<`ZodEnum`\<\{ `FAS`: `"FAS"`; `ITT`: `"ITT"`; `PER_PROTOCOL`: `"PER_PROTOCOL"`; `SAFETY`: `"SAFETY"`; `SCREENED`: `"SCREENED"`; \}\>\>; `sex`: `ZodEnum`\<\{ `F`: `"F"`; `M`: `"M"`; \}\>; \}, `$strip`\>\>; `subjectId`: `ZodString`; \}, `$strip`\>

One subject joining or leaving analysis populations. Applying it to a
snapshot produces the next version; `effectiveAt` becomes that version's
`capturedAt`, so no clock is read.

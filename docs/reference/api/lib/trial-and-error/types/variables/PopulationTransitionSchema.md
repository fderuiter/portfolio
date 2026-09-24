[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / PopulationTransitionSchema

# Variable: PopulationTransitionSchema

> `const` **PopulationTransitionSchema**: `ZodObject`\<\{ `change`: `ZodEnum`\<\{ `JOIN`: `"JOIN"`; `LEAVE`: `"LEAVE"`; \}\>; `description`: `ZodString`; `effectiveAt`: `ZodISODateTime`; `id`: `ZodString`; `populations`: `ZodArray`\<`ZodEnum`\<\{ `FAS`: `"FAS"`; `ITT`: `"ITT"`; `PER_PROTOCOL`: `"PER_PROTOCOL"`; `SAFETY`: `"SAFETY"`; `SCREENED`: `"SCREENED"`; \}\>\>; `reason`: `ZodEnum`\<\{ `DROPOUT`: `"DROPOUT"`; `PROTOCOL_AMENDMENT`: `"PROTOCOL_AMENDMENT"`; `PROTOCOL_DEVIATION`: `"PROTOCOL_DEVIATION"`; `SCREEN_FAILURE`: `"SCREEN_FAILURE"`; \}\>; `subjectId`: `ZodString`; \}, `$strip`\>

One subject joining or leaving analysis populations. Applying it to a
snapshot produces the next version; `effectiveAt` becomes that version's
`capturedAt`, so no clock is read.

[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / CrisisEffectSchema

# Variable: CrisisEffectSchema

> `const` **CrisisEffectSchema**: `ZodObject`\<\{ `budget`: `ZodOptional`\<`ZodNumber`\>; `cpu`: `ZodOptional`\<`ZodNumber`\>; `grantSeal`: `ZodOptional`\<`ZodObject`\<\{ `effect`: `ZodDiscriminatedUnion`\<\[`ZodObject`\<\{ `kind`: `ZodLiteral`\<`"PLUS_CHIPS"`\>; `value`: `ZodNumber`; \}, `$strip`\>, `ZodObject`\<\{ `kind`: `ZodLiteral`\<`"PLUS_MULT"`\>; `value`: `ZodNumber`; \}, `$strip`\>, `ZodObject`\<\{ `kind`: `ZodLiteral`\<`"WAIVE"`\>; \}, `$strip`\>\], `"kind"`\>; `eligible`: `ZodObject`\<\{ `cardTypes`: `ZodOptional`\<`ZodArray`\<`ZodEnum`\<\{ `FIGURE`: ...; `LISTING`: ...; `SUBJECT_TOKEN`: ...; `TABLE`: ...; \}\>\>\>; `populations`: `ZodOptional`\<`ZodArray`\<`ZodEnum`\<\{ `FAS`: ...; `ITT`: ...; `PER_PROTOCOL`: ...; `SAFETY`: ...; `SCREENED`: ...; \}\>\>\>; `topics`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; \}, `$strip`\>; `footnote`: `ZodString`; `id`: `ZodString`; `name`: `ZodString`; `sellValue`: `ZodNumber`; \}, `$strip`\>\>; `modifier`: `ZodOptional`\<`ZodObject`\<\{ `debuffType`: `ZodEnum`\<\{ `BLIND_FIREWALL`: `"BLIND_FIREWALL"`; `DISABLE_POPULATION`: `"DISABLE_POPULATION"`; `DISCARD_PENALTY`: `"DISCARD_PENALTY"`; `HAND_LIMIT`: `"HAND_LIMIT"`; \}\>; `description`: `ZodString`; `disabledPopulations`: `ZodOptional`\<`ZodArray`\<`ZodEnum`\<\{ `FAS`: `"FAS"`; `ITT`: `"ITT"`; `PER_PROTOCOL`: `"PER_PROTOCOL"`; `SAFETY`: `"SAFETY"`; `SCREENED`: `"SCREENED"`; \}\>\>\>; `discardCpuPenalty`: `ZodOptional`\<`ZodNumber`\>; `id`: `ZodString`; `maxHandsAllowed`: `ZodOptional`\<`ZodNumber`\>; `name`: `ZodString`; \}, `$strip`\>\>; `spendSeal`: `ZodOptional`\<`ZodLiteral`\<`true`\>\>; `transition`: `ZodOptional`\<`ZodObject`\<\{ `change`: `ZodEnum`\<\{ `JOIN`: `"JOIN"`; `LEAVE`: `"LEAVE"`; \}\>; `description`: `ZodString`; `effectiveAt`: `ZodISODateTime`; `id`: `ZodString`; `populations`: `ZodArray`\<`ZodEnum`\<\{ `FAS`: `"FAS"`; `ITT`: `"ITT"`; `PER_PROTOCOL`: `"PER_PROTOCOL"`; `SAFETY`: `"SAFETY"`; `SCREENED`: `"SCREENED"`; \}\>\>; `reason`: `ZodEnum`\<\{ `DROPOUT`: `"DROPOUT"`; `PROTOCOL_AMENDMENT`: `"PROTOCOL_AMENDMENT"`; `PROTOCOL_DEVIATION`: `"PROTOCOL_DEVIATION"`; `SCREEN_FAILURE`: `"SCREEN_FAILURE"`; \}\>; `subjectId`: `ZodString`; \}, `$strip`\>\>; \}, `$strip`\>

What one crisis choice does. Every field is optional and deterministic:
CPU and study budget deltas, a footnote seal granted to the tray or one
spent from it, a population transition (routed through snapshot
invalidation, so matching outputs go stale), and a modifier imposed on
the current Blind.

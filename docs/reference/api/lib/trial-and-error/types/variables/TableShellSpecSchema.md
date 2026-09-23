[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / TableShellSpecSchema

# Variable: TableShellSpecSchema

> `const` **TableShellSpecSchema**: `ZodObject`\<\{ `allowedFootnoteSlots`: `ZodNumber`; `cardType`: `ZodEnum`\<\{ `FIGURE`: `"FIGURE"`; `LISTING`: `"LISTING"`; `SUBJECT_TOKEN`: `"SUBJECT_TOKEN"`; `TABLE`: `"TABLE"`; \}\>; `chips`: `ZodNumber`; `id`: `ZodString`; `isBlinded`: `ZodOptional`\<`ZodBoolean`\>; `mult`: `ZodNumber`; `requiredRulebookId`: `ZodString`; `tableNumber`: `ZodString`; `targetPopulation`: `ZodEnum`\<\{ `FAS`: `"FAS"`; `ITT`: `"ITT"`; `PER_PROTOCOL`: `"PER_PROTOCOL"`; `SAFETY`: `"SAFETY"`; `SCREENED`: `"SCREENED"`; \}\>; `title`: `ZodString`; \}, `$strip`\>

A planned output (Table, Listing or Figure) and its scoring weight.

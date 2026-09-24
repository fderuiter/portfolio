[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / FootnoteSealSchema

# Variable: FootnoteSealSchema

> `const` **FootnoteSealSchema**: `ZodObject`\<\{ `effect`: `ZodDiscriminatedUnion`\<\[`ZodObject`\<\{ `kind`: `ZodLiteral`\<`"PLUS_CHIPS"`\>; `value`: `ZodNumber`; \}, `$strip`\>, `ZodObject`\<\{ `kind`: `ZodLiteral`\<`"PLUS_MULT"`\>; `value`: `ZodNumber`; \}, `$strip`\>, `ZodObject`\<\{ `kind`: `ZodLiteral`\<`"WAIVE"`\>; \}, `$strip`\>\], `"kind"`\>; `eligible`: `ZodObject`\<\{ `cardTypes`: `ZodOptional`\<`ZodArray`\<`ZodEnum`\<\{ `FIGURE`: `"FIGURE"`; `LISTING`: `"LISTING"`; `SUBJECT_TOKEN`: `"SUBJECT_TOKEN"`; `TABLE`: `"TABLE"`; \}\>\>\>; `populations`: `ZodOptional`\<`ZodArray`\<`ZodEnum`\<\{ `FAS`: `"FAS"`; `ITT`: `"ITT"`; `PER_PROTOCOL`: `"PER_PROTOCOL"`; `SAFETY`: `"SAFETY"`; `SCREENED`: `"SCREENED"`; \}\>\>\>; `topics`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; \}, `$strip`\>; `footnote`: `ZodString`; `id`: `ZodString`; `name`: `ZodString`; `sellValue`: `ZodNumber`; \}, `$strip`\>

A footnote seal: a single-use consumable that affixes a real table
footnote to an output, legitimising a presentation choice. Its effect is
recorded as its own rule result, so it is always traceable.

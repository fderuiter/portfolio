[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / TlfCardSchema

# Variable: TlfCardSchema

> `const` **TlfCardSchema**: `ZodObject`\<\{ `cardType`: `ZodEnum`\<\{ `FIGURE`: `"FIGURE"`; `LISTING`: `"LISTING"`; `SUBJECT_TOKEN`: `"SUBJECT_TOKEN"`; `TABLE`: `"TABLE"`; \}\>; `chips`: `ZodNumber`; `csrStage`: `ZodOptional`\<`ZodEnum`\<\{ `BASELINE`: `"BASELINE"`; `DISPOSITION`: `"DISPOSITION"`; `EFFICACY`: `"EFFICACY"`; `PATIENT_LISTING`: `"PATIENT_LISTING"`; `SAFETY_AE`: `"SAFETY_AE"`; \}\>\>; `draftId`: `ZodOptional`\<`ZodString`\>; `id`: `ZodString`; `mult`: `ZodNumber`; `number`: `ZodString`; `population`: `ZodEnum`\<\{ `FAS`: `"FAS"`; `ITT`: `"ITT"`; `PER_PROTOCOL`: `"PER_PROTOCOL"`; `SAFETY`: `"SAFETY"`; `SCREENED`: `"SCREENED"`; \}\>; `soc`: `ZodOptional`\<`ZodString`\>; `title`: `ZodString`; `topic`: `ZodString`; \}, `$strip`\>

A TLF card on the Card Table. `topic` links a Table to its supporting
Listing (TLF Pair) and a Figure to the Table it depends on (Efficacy Full
House). `draftId` points at a staged table in the scenario's draw pile when
the card has reviewable cells.

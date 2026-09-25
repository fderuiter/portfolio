[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / GuidanceCardSchema

# Variable: GuidanceCardSchema

> `const` **GuidanceCardSchema**: `ZodObject`\<\{ `document`: `ZodString`; `flavor`: `ZodString`; `handType`: `ZodEnum`\<\{ `CSR_STRAIGHT`: `"CSR_STRAIGHT"`; `EFFICACY_FULL_HOUSE`: `"EFFICACY_FULL_HOUSE"`; `HIGH_TABLE`: `"HIGH_TABLE"`; `MEDDRA_FIVE_OF_A_KIND`: `"MEDDRA_FIVE_OF_A_KIND"`; `POPULATION_FLUSH`: `"POPULATION_FLUSH"`; `TLF_PAIR`: `"TLF_PAIR"`; `TLF_TWO_PAIR`: `"TLF_TWO_PAIR"`; \}\>; `id`: `ZodString`; `name`: `ZodString`; `sellValue`: `ZodNumber`; \}, `$strip`\>

A Guidance card: a consumable named after a real guidance document. Using
it levels its hand type up by one for the rest of the run; the bonus per
level is the hand's, in `HAND_LEVEL_BONUS`. Flavour text is a joke, not
regulatory advice.

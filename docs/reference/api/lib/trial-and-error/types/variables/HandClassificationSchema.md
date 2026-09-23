[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / HandClassificationSchema

# Variable: HandClassificationSchema

> `const` **HandClassificationSchema**: `ZodObject`\<\{ `handType`: `ZodEnum`\<\{ `CSR_STRAIGHT`: `"CSR_STRAIGHT"`; `EFFICACY_FULL_HOUSE`: `"EFFICACY_FULL_HOUSE"`; `HIGH_TABLE`: `"HIGH_TABLE"`; `MEDDRA_FIVE_OF_A_KIND`: `"MEDDRA_FIVE_OF_A_KIND"`; `POPULATION_FLUSH`: `"POPULATION_FLUSH"`; `TLF_PAIR`: `"TLF_PAIR"`; `TLF_TWO_PAIR`: `"TLF_TWO_PAIR"`; \}\>; `scoringCardIds`: `ZodArray`\<`ZodString`\>; \}, `$strip`\>

The best hand a selection makes, and the cards that actually score.

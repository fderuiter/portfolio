[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / HandBaseScoreSchema

# Variable: HandBaseScoreSchema

> `const` **HandBaseScoreSchema**: `ZodObject`\<\{ `baseChips`: `ZodNumber`; `baseMult`: `ZodNumber`; `description`: `ZodString`; `handType`: `ZodEnum`\<\{ `CSR_STRAIGHT`: `"CSR_STRAIGHT"`; `EFFICACY_FULL_HOUSE`: `"EFFICACY_FULL_HOUSE"`; `HIGH_TABLE`: `"HIGH_TABLE"`; `MEDDRA_FIVE_OF_A_KIND`: `"MEDDRA_FIVE_OF_A_KIND"`; `POPULATION_FLUSH`: `"POPULATION_FLUSH"`; `TLF_PAIR`: `"TLF_PAIR"`; `TLF_TWO_PAIR`: `"TLF_TWO_PAIR"`; \}\>; \}, `$strip`\>

Base Chips and base +Mult a hand type is worth before any card is scored.

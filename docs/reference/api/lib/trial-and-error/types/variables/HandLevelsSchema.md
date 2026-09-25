[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / HandLevelsSchema

# Variable: HandLevelsSchema

> `const` **HandLevelsSchema**: `ZodRecord`\<`ZodEnum`\<\{ `CSR_STRAIGHT`: `"CSR_STRAIGHT"`; `EFFICACY_FULL_HOUSE`: `"EFFICACY_FULL_HOUSE"`; `HIGH_TABLE`: `"HIGH_TABLE"`; `MEDDRA_FIVE_OF_A_KIND`: `"MEDDRA_FIVE_OF_A_KIND"`; `POPULATION_FLUSH`: `"POPULATION_FLUSH"`; `TLF_PAIR`: `"TLF_PAIR"`; `TLF_TWO_PAIR`: `"TLF_TWO_PAIR"`; \}\>, `ZodObject`\<\{ `level`: `ZodNumber`; `playedCount`: `ZodNumber`; \}, `$strip`\>\>

The run's hand levels: one entry per hand type, every hand starting at
level 1. Guidance cards level a hand up for the rest of the run.

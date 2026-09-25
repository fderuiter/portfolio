[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / EncounterStageSchema

# Variable: EncounterStageSchema

> `const` **EncounterStageSchema**: `ZodObject`\<\{ `hands`: `ZodArray`\<`ZodEnum`\<\{ `CSR_STRAIGHT`: `"CSR_STRAIGHT"`; `EFFICACY_FULL_HOUSE`: `"EFFICACY_FULL_HOUSE"`; `HIGH_TABLE`: `"HIGH_TABLE"`; `MEDDRA_FIVE_OF_A_KIND`: `"MEDDRA_FIVE_OF_A_KIND"`; `POPULATION_FLUSH`: `"POPULATION_FLUSH"`; `TLF_PAIR`: `"TLF_PAIR"`; `TLF_TWO_PAIR`: `"TLF_TWO_PAIR"`; \}\>\>; `name`: `ZodString`; `quota`: `ZodNumber`; `session`: `ZodEnum`\<\{ `CLOSED`: `"CLOSED"`; `OPEN`: `"OPEN"`; \}\>; \}, `$strip`\>

One stage of a staged Boss encounter: the DMC session it is played in, the
hands it accepts, and the score that defends it.

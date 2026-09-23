[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / HandInputSchema

# Variable: HandInputSchema

> `const` **HandInputSchema**: `ZodObject`\<\{ `cards`: `ZodArray`\<`ZodObject`\<\{ `chips`: `ZodNumber`; `id`: `ZodString`; `mult`: `ZodNumber`; \}, `$strip`\>\>; `handType`: `ZodEnum`\<\{ `CSR_STRAIGHT`: `"CSR_STRAIGHT"`; `EFFICACY_FULL_HOUSE`: `"EFFICACY_FULL_HOUSE"`; `HIGH_TABLE`: `"HIGH_TABLE"`; `MEDDRA_FIVE_OF_A_KIND`: `"MEDDRA_FIVE_OF_A_KIND"`; `POPULATION_FLUSH`: `"POPULATION_FLUSH"`; `TLF_PAIR`: `"TLF_PAIR"`; `TLF_TWO_PAIR`: `"TLF_TWO_PAIR"`; \}\>; `modifiers`: `ZodOptional`\<`ZodArray`\<`ZodObject`\<\{ `chips`: `ZodNumber`; `label`: `ZodString`; `plusMult`: `ZodNumber`; `sourceId`: `ZodString`; `xMult`: `ZodNumber`; \}, `$strip`\>\>\>; `ruleResults`: `ZodArray`\<`ZodObject`\<\{ `cellCoordinates`: `ZodOptional`\<`ZodObject`\<\{ `col`: `ZodNumber`; `row`: `ZodNumber`; \}, `$strip`\>\>; `chipsDelta`: `ZodNumber`; `evidence`: `ZodString`; `multDelta`: `ZodNumber`; `multMultiplier`: `ZodOptional`\<`ZodNumber`\>; `passed`: `ZodBoolean`; `ruleId`: `ZodString`; \}, `$strip`\>\>; \}, `$strip`\>

Everything the evaluator needs to score one hand.

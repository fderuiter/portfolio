[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/game-config-schemas](../README.md) / QuasiPuzzlerConfigSchema

# Variable: QuasiPuzzlerConfigSchema

> `const` **QuasiPuzzlerConfigSchema**: `ZodObject`\<\{ `difficulty`: `ZodDefault`\<`ZodEnum`\<\{ `easy`: `"easy"`; `hard`: `"hard"`; `medium`: `"medium"`; \}\>\>; `gameId`: `ZodString`; `handLimit`: `ZodDefault`\<`ZodNumber`\>; `playerName`: `ZodDefault`\<`ZodString`\>; `proofGoal`: `ZodDefault`\<`ZodEnum`\<\{ `double_negation`: `"double_negation"`; `identity`: `"identity"`; `modus_ponens`: `"modus_ponens"`; `syllogism`: `"syllogism"`; \}\>\>; `tacticSelections`: `ZodDefault`\<`ZodArray`\<`ZodString`\>\>; \}, `$strip`\>

Defined in: [lib/game-config-schemas.ts:64](https://github.com/fderuiter/portfolio/blob/main/lib/game-config-schemas.ts#L64)

[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/game-config-schemas](../README.md) / ClinicalChaosConfigSchema

# Variable: ClinicalChaosConfigSchema

> `const` **ClinicalChaosConfigSchema**: `ZodObject`\<\{ `difficulty`: `ZodDefault`\<`ZodEnum`\<\{ `easy`: `"easy"`; `hard`: `"hard"`; `medium`: `"medium"`; \}\>\>; `gameId`: `ZodString`; `playerName`: `ZodDefault`\<`ZodString`\>; `sdtmDomains`: `ZodDefault`\<`ZodArray`\<`ZodEnum`\<\{ `AE`: `"AE"`; `DM`: `"DM"`; `LB`: `"LB"`; `VS`: `"VS"`; \}\>\>\>; `validationErrorThreshold`: `ZodDefault`\<`ZodNumber`\>; \}, `$strip`\>

Defined in: [lib/game-config-schemas.ts:12](https://github.com/fderuiter/portfolio/blob/main/lib/game-config-schemas.ts#L12)

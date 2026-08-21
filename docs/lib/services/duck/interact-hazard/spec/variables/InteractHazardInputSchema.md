[**fderuiter-portfolio**](../../../../../../README.md)

***

[fderuiter-portfolio](../../../../../../modules.md) / [lib/services/duck/interact-hazard/spec](../README.md) / InteractHazardInputSchema

# Variable: InteractHazardInputSchema

> `const` **InteractHazardInputSchema**: `ZodObject`\<\{ `action`: `ZodEnum`\<\{ `distract_with_kong`: `"distract_with_kong"`; `distract_with_squeaky`: `"distract_with_squeaky"`; `fix_hazard`: `"fix_hazard"`; \}\>; `hazardId`: `ZodOptional`\<`ZodString`\>; `state`: `ZodCustom`\<[`WorkingWithDuckState`](../../../../../working-with-duck-engine/interfaces/WorkingWithDuckState.md), [`WorkingWithDuckState`](../../../../../working-with-duck-engine/interfaces/WorkingWithDuckState.md)\>; `x`: `ZodDefault`\<`ZodOptional`\<`ZodNumber`\>\>; `y`: `ZodDefault`\<`ZodOptional`\<`ZodNumber`\>\>; \}, `$strip`\>

Defined in: [lib/services/duck/interact-hazard/spec.ts:9](https://github.com/fderuiter/portfolio/blob/main/lib/services/duck/interact-hazard/spec.ts#L9)

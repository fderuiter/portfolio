[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / BossBlindModifierSchema

# Variable: BossBlindModifierSchema

> `const` **BossBlindModifierSchema**: `ZodObject`\<\{ `debuffType`: `ZodEnum`\<\{ `BLIND_FIREWALL`: `"BLIND_FIREWALL"`; `DISABLE_POPULATION`: `"DISABLE_POPULATION"`; `DISCARD_PENALTY`: `"DISCARD_PENALTY"`; `HAND_LIMIT`: `"HAND_LIMIT"`; \}\>; `description`: `ZodString`; `disabledPopulations`: `ZodOptional`\<`ZodArray`\<`ZodEnum`\<\{ `FAS`: `"FAS"`; `ITT`: `"ITT"`; `PER_PROTOCOL`: `"PER_PROTOCOL"`; `SAFETY`: `"SAFETY"`; `SCREENED`: `"SCREENED"`; \}\>\>\>; `discardCpuPenalty`: `ZodOptional`\<`ZodNumber`\>; `id`: `ZodString`; `maxHandsAllowed`: `ZodOptional`\<`ZodNumber`\>; `name`: `ZodString`; \}, `$strip`\>

A Boss Blind's rule twist. `DISABLE_POPULATION` scores every output built
on one of `disabledPopulations` at 0 Chips. The other debuff types are
declared for later bosses and have no effect yet.

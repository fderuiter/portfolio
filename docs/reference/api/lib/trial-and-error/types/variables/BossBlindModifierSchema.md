[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / BossBlindModifierSchema

# Variable: BossBlindModifierSchema

> `const` **BossBlindModifierSchema**: `ZodObject`\<\{ `debuffType`: `ZodEnum`\<\{ `BLIND_FIREWALL`: `"BLIND_FIREWALL"`; `DISABLE_POPULATION`: `"DISABLE_POPULATION"`; `DISCARD_PENALTY`: `"DISCARD_PENALTY"`; `HAND_LIMIT`: `"HAND_LIMIT"`; \}\>; `description`: `ZodString`; `disabledPopulations`: `ZodOptional`\<`ZodArray`\<`ZodEnum`\<\{ `FAS`: `"FAS"`; `ITT`: `"ITT"`; `PER_PROTOCOL`: `"PER_PROTOCOL"`; `SAFETY`: `"SAFETY"`; `SCREENED`: `"SCREENED"`; \}\>\>\>; `discardCpuPenalty`: `ZodOptional`\<`ZodNumber`\>; `id`: `ZodString`; `maxHandsAllowed`: `ZodOptional`\<`ZodNumber`\>; `name`: `ZodString`; \}, `$strip`\>

A Blind's rule twist, imposed by its boss or by a crisis choice.
`DISABLE_POPULATION` scores every output built on one of
`disabledPopulations` at 0 Chips. `HAND_LIMIT` fails the Blind once
`maxHandsAllowed` hands have been played short of the target.
`DISCARD_PENALTY` adds `discardCpuPenalty` CPU to every discard.
`BLIND_FIREWALL` turns treatment-arm values face down: they are absent
from the derived view, and no output can be inspected.

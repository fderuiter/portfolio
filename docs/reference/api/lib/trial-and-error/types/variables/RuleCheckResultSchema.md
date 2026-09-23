[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / RuleCheckResultSchema

# Variable: RuleCheckResultSchema

> `const` **RuleCheckResultSchema**: `ZodObject`\<\{ `cellCoordinates`: `ZodOptional`\<`ZodObject`\<\{ `col`: `ZodNumber`; `row`: `ZodNumber`; \}, `$strip`\>\>; `chipsDelta`: `ZodNumber`; `evidence`: `ZodString`; `multDelta`: `ZodNumber`; `multMultiplier`: `ZodOptional`\<`ZodNumber`\>; `passed`: `ZodBoolean`; `ruleId`: `ZodString`; \}, `$strip`\>

The scoring consequence of one rule check. `multMultiplier` of 0 is the
zero-score rule: it forces the hand's final Mult to 0.

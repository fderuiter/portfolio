[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / ScoreLedgerEntrySchema

# Variable: ScoreLedgerEntrySchema

> `const` **ScoreLedgerEntrySchema**: `ZodObject`\<\{ `kind`: `ZodEnum`\<\{ `CHIPS`: `"CHIPS"`; `PLUS_MULT`: `"PLUS_MULT"`; `X_MULT`: `"X_MULT"`; \}\>; `label`: `ZodString`; `sourceId`: `ZodString`; `step`: `ZodUnion`\<readonly \[`ZodLiteral`\<`1`\>, `ZodLiteral`\<`2`\>, `ZodLiteral`\<`3`\>, `ZodLiteral`\<`4`\>\]\>; `value`: `ZodNumber`; \}, `$strip`\>

One line of the score ledger, tagged with its pipeline step.

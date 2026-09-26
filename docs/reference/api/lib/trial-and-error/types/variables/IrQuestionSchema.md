[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / IrQuestionSchema

# Variable: IrQuestionSchema

> `const` **IrQuestionSchema**: `ZodObject`\<\{ `cardId`: `ZodString`; `id`: `ZodString`; `question`: `ZodString`; `quota`: `ZodNumber`; \}, `$strip`\>

One targeted question in an FDA Information Request: the output the FDA
asks for, and the share of the Blind's quota answering it clears. A played
hand whose scoring cards include `cardId` answers it when the hand scores
at least `quota` (#921).

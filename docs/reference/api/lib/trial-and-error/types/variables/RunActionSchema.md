[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / RunActionSchema

# Variable: RunActionSchema

> `const` **RunActionSchema**: `ZodDiscriminatedUnion`\<\[`ZodObject`\<\{ `cardId`: `ZodString`; `type`: `ZodLiteral`\<`"TOGGLE_SELECT"`\>; \}, `$strip`\>, `ZodObject`\<\{ `type`: `ZodLiteral`\<`"PLAY_HAND"`\>; \}, `$strip`\>, `ZodObject`\<\{ `type`: `ZodLiteral`\<`"DISCARD"`\>; \}, `$strip`\>, `ZodObject`\<\{ `cardId`: `ZodString`; `type`: `ZodLiteral`\<`"INSPECT_CARD"`\>; \}, `$strip`\>\], `"type"`\>

Every move a run records, as data (#1079). A saved run is its seed and
these moves, replayed on load, so the save never holds a compiled value:
blinded outputs stay out of storage by construction.

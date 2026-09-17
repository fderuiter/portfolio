[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/schemas](../README.md) / ReactionPostResponseSchema

# Variable: ReactionPostResponseSchema

> `const` **ReactionPostResponseSchema**: `ZodObject`\<\{ `counts`: `ZodObject`\<\{ `actionable`: `ZodNumber`; `insightful`: `ZodNumber`; `mind_blowing`: `ZodNumber`; `thorough`: `ZodNumber`; \}, `$strip`\>; `reactionType`: `ZodEnum`\<\{ `actionable`: `"actionable"`; `insightful`: `"insightful"`; `mind_blowing`: `"mind_blowing"`; `thorough`: `"thorough"`; \}\>; `success`: `ZodBoolean`; `userReactions`: `ZodArray`\<`ZodString`\>; \}, `$strip`\>

Schema for Reaction POST response

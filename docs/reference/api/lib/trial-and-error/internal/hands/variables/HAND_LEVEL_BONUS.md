[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/hands](../README.md) / HAND\_LEVEL\_BONUS

# Variable: HAND\_LEVEL\_BONUS

> `const` **HAND\_LEVEL\_BONUS**: `Readonly`\<`Record`\<[`HandType`](../../../types/type-aliases/HandType.md), \{ `chips`: `number`; `mult`: `number`; \}\>\>

What each level above 1 adds to a hand's base, balanced in T&E-UX-05
(#947). A hand at level `n` scores its base plus `n - 1` bonuses.

[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/hands](../README.md) / ClassifiableCard

# Type Alias: ClassifiableCard

> **ClassifiableCard** = `Pick`\<[`TlfCard`](../../../types/type-aliases/TlfCard.md), `"id"` \| `"cardType"` \| `"population"` \| `"chips"` \| `"topic"` \| `"csrStage"` \| `"soc"`\> & `object`

The card fields hand detection reads. `stale` marks an output compiled
against a population snapshot that has since changed; it cannot make a
Population Flush.

## Type Declaration

### stale?

> `optional` **stale?**: `boolean`

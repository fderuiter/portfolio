[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/scoring](../README.md) / RuleResultOptions

# Interface: RuleResultOptions

Which findings the scoring view should see and which are corrected.

## Properties

### resolvedFindingIds

> **resolvedFindingIds**: readonly `string`[]

Findings the reviewer has corrected.

***

### visibleFindingIds?

> `optional` **visibleFindingIds?**: readonly `string`[]

When provided, only these findings are scored: the reviewer's known view
of the hand. Omit it to score the hand as it truly is.

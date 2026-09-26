[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/table](../README.md) / ScoreLogEffect

# Interface: ScoreLogEffect

One effect that fired in a logged hand, labelled as the score timeline labels it.

## Properties

### effect

> **effect**: `string`

What it did, e.g. "+20 Chips" or "×0". Never a blinded cell value.

***

### kind

> **kind**: `"X_MULT"` \| `"RELIC"` \| `"RULE"` \| `"ZERO_RULE"`

***

### label

> **label**: `string`

The rule or relic id, the ×Mult source, or the zero rule's slam label.

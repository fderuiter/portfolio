[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/rounding](../README.md) / roundRatio

# Function: roundRatio()

> **roundRatio**(`numerator`, `denominator`, `precision`, `mode`): `string` \| `null`

Rounds `numerator / denominator` to `precision` decimal places using exact
integer arithmetic, so ties such as 45.25 are detected exactly rather than
through binary floating point. Returns the fixed-point string, or `null`
when the ratio is not computable (zero or non-integer operands, or an
out-of-range precision).

## Parameters

### numerator

`number`

### denominator

`number`

### precision

`number`

### mode

`"HALF_EVEN"` \| `"HALF_AWAY_FROM_ZERO"` \| `"TRUNCATE"`

## Returns

`string` \| `null`

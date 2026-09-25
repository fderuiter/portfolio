[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/shop](../README.md) / cashOut

# Function: cashOut()

> **cashOut**(`tier`, `cpuLeft`, `budget`): [`CashOutReport`](../interfaces/CashOutReport.md)

The sponsor's payout for a cleared Blind: a base by tier, $1k per unspent
Hand-equivalent of CPU, and interest of $1k per $5k already held, capped.
Every amount is a whole, non-negative number of $k.

## Parameters

### tier

`"SMALL_BLIND"` \| `"BIG_BLIND"` \| `"BOSS_BLIND"`

### cpuLeft

`number`

### budget

`number`

## Returns

[`CashOutReport`](../interfaces/CashOutReport.md)

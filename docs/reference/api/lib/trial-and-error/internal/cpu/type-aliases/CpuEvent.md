[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/cpu](../README.md) / CpuEvent

# Type Alias: CpuEvent

> **CpuEvent** = \{ `action`: [`CpuAction`](CpuAction.md); `type`: `"SPEND"`; \} \| \{ `available`: `number`; `type`: `"REPLENISH"`; \}

Events the CPU reducer understands. `SPEND` pays for one action;
`REPLENISH` refills the ledger to the Blind's allocation, which happens
once, deterministically, when each Blind starts.

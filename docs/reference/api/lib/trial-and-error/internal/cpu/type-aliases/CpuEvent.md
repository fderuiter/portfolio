[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/cpu](../README.md) / CpuEvent

# Type Alias: CpuEvent

> **CpuEvent** = \{ `action`: [`CpuAction`](CpuAction.md); `surcharge?`: `number`; `type`: `"SPEND"`; \} \| \{ `available`: `number`; `type`: `"REPLENISH"`; \} \| \{ `delta`: `number`; `type`: `"ADJUST"`; \}

Events the CPU reducer understands. `SPEND` pays for one action, plus any
`surcharge` a Blind modifier adds (a site audit's discard penalty);
`REPLENISH` refills the ledger to the Blind's allocation, which happens
once, deterministically, when each Blind starts; `ADJUST` applies a crisis
choice's CPU change, never below zero.

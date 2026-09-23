[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/cpu](../README.md) / cpuReducer

# Function: cpuReducer()

> **cpuReducer**(`ledger`, `event`): [`CpuLedger`](../interfaces/CpuLedger.md)

Pure CPU reducer. An unaffordable spend returns the same ledger object, so
callers can detect the refusal by identity.

## Parameters

### ledger

[`CpuLedger`](../interfaces/CpuLedger.md)

### event

[`CpuEvent`](../type-aliases/CpuEvent.md)

## Returns

[`CpuLedger`](../interfaces/CpuLedger.md)

[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/table](../README.md) / TableEvent

# Interface: TableEvent

The most recent Card Table outcome, phrased for a polite announcement.

## Properties

### kind

> **kind**: `"RESET"` \| `"INSPECTED"` \| `"CORRECTED"` \| `"PLAYED"` \| `"DISCARDED"` \| `"REFUSED"` \| `"SELECTED"` \| `"DESELECTED"` \| `"INSPECT_OPENED"` \| `"INSPECT_CLOSED"`

***

### message

> **message**: `string`

***

### sequence

> **sequence**: `number`

Increments on every event so repeated messages are still announced.

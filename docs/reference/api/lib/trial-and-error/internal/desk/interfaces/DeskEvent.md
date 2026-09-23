[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/desk](../README.md) / DeskEvent

# Interface: DeskEvent

The most recent outcome, phrased for a polite live announcement.

## Properties

### kind

> **kind**: `"RESET"` \| `"INSPECTED"` \| `"CORRECTED"` \| `"PLAYED"` \| `"DISCARDED"` \| `"REFUSED"`

***

### message

> **message**: `string`

***

### sequence

> **sequence**: `number`

Increments on every event so repeated messages are still announced.

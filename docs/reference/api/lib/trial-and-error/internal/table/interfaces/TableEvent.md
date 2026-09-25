[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/table](../README.md) / TableEvent

# Interface: TableEvent

The most recent Card Table outcome, phrased for a polite announcement.

## Properties

### kind

> **kind**: `"RESET"` \| `"INSPECTED"` \| `"CORRECTED"` \| `"PLAYED"` \| `"DISCARDED"` \| `"REFUSED"` \| `"SELECTED"` \| `"DESELECTED"` \| `"INSPECT_OPENED"` \| `"INSPECT_CLOSED"` \| `"MOVED"` \| `"BLIND_STARTED"` \| `"RECOMPILED"` \| `"ALLOCATED"` \| `"SEALED"` \| `"SOLD"` \| `"LEVELED_UP"` \| `"CRISIS_RESOLVED"` \| `"TRACED"`

***

### levelUp?

> `optional` **levelUp?**: [`LevelUp`](LevelUp.md)

On LEVELED_UP: the hand that levelled and its base before and after.

***

### message

> **message**: `string`

***

### sequence

> **sequence**: `number`

Increments on every event so repeated messages are still announced.

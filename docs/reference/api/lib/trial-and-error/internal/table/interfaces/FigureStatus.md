[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/table](../README.md) / FigureStatus

# Interface: FigureStatus

A dependent Figure's ×Mult badge: its parent, and why it is off if it is.

## Properties

### active

> **active**: `boolean`

The ×Mult applies if the Figure is played now.

***

### blocked

> **blocked**: `boolean`

The parent is missing, stale or unvalidated: the Figure cannot compile.

***

### parent

> **parent**: `string`

The parent Table's number.

***

### reason

> **reason**: `string` \| `null`

Why the ×Mult is off, or null when it is active.

***

### xMult

> **xMult**: `number`

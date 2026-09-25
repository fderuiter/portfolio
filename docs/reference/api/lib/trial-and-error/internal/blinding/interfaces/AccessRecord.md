[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/blinding](../README.md) / AccessRecord

# Interface: AccessRecord

One entry in the Blind's DMC access history.

## Properties

### authorized

> **authorized**: `boolean`

Whether governance allowed it. An unauthorized unblinding is a violation.

***

### cardId

> **cardId**: `string` \| `null`

The output accessed, or null for a session change.

***

### handsPlayed

> **handsPlayed**: `number`

Hands played before the access, for ordering against the score log.

***

### kind

> **kind**: [`AccessKind`](../type-aliases/AccessKind.md)

***

### seq

> **seq**: `number`

1-based, in the order the accesses happened.

***

### session

> **session**: [`DmcSession`](../type-aliases/DmcSession.md)

The session in force when the access happened.

***

### text

> **text**: `string`

[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/patrol/types](../README.md) / DialogueOption

# Interface: DialogueOption

A single selectable line of dialogue within a `DialogueMoment`.

## Properties

### clarity

> **clarity**: `"high"` \| `"moderate"` \| `"low"`

How unambiguous the instruction or statement is to the listener.

***

### closesLoop?

> `optional` **closesLoop?**: `boolean`

Whether the option explicitly requests confirmation/read-back (closed-loop communication).

***

### debriefNote

> **debriefNote**: `string`

Neutral, descriptive note surfaced in debrief — describes the style and its effect, not a verdict.

***

### id

> **id**: `string`

***

### response

> **response**: `string`

The other party's in-fiction reply to this choice.

***

### style

> **style**: [`DialogueStyle`](../type-aliases/DialogueStyle.md)

Communication/delegation style this option exemplifies.

***

### text

> **text**: `string`

The line the player-patroller speaks or transmits.

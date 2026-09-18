[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/patrol/dialogue](../README.md) / createDialogueChoiceEvent

# Function: createDialogueChoiceEvent()

> **createDialogueChoiceEvent**(`scenarioId`, `moment`, `option`, `timestamp?`): [`PatrolEvent`](../../types/interfaces/PatrolEvent.md)

Builds the rich `PatrolEvent` recorded when a patroller selects a dialogue
option, carrying enough context (style, clarity, closed-loop status,
in-fiction response) for the M7 debrief to reference the specific moment
without re-deriving it from raw UI state.

## Parameters

### scenarioId

`string`

### moment

[`DialogueMoment`](../../types/interfaces/DialogueMoment.md)

### option

[`DialogueOption`](../../types/interfaces/DialogueOption.md)

### timestamp?

`number` = `...`

## Returns

[`PatrolEvent`](../../types/interfaces/PatrolEvent.md)

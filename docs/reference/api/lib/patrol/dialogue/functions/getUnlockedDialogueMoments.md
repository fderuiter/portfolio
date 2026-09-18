[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/patrol/dialogue](../README.md) / getUnlockedDialogueMoments

# Function: getUnlockedDialogueMoments()

> **getUnlockedDialogueMoments**(`moments`, `actionHistory`): [`DialogueMoment`](../../types/interfaces/DialogueMoment.md)[]

Returns the dialogue moments from a scenario that are currently unlocked
given the actions already performed on scene.

A moment with no `afterActionId` is available immediately; otherwise it
unlocks once the referenced action has been executed.

## Parameters

### moments

[`DialogueMoment`](../../types/interfaces/DialogueMoment.md)[] \| `undefined`

### actionHistory

[`ScenarioAction`](../../types/interfaces/ScenarioAction.md)[]

## Returns

[`DialogueMoment`](../../types/interfaces/DialogueMoment.md)[]

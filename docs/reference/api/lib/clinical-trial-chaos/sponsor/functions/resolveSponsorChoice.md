[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/clinical-trial-chaos/sponsor](../README.md) / resolveSponsorChoice

# Function: resolveSponsorChoice()

> **resolveSponsorChoice**(`state`, `choiceIndex`, `rand?`): `object`

Answers the active sponsor email with the chosen option. Returns the unchanged
state and `null` effects when there is no active email or the index is invalid.

## Parameters

### state

[`SponsorState`](../interfaces/SponsorState.md)

### choiceIndex

`number`

### rand?

() => `number`

## Returns

`object`

### effects

> **effects**: [`SponsorChoiceEffects`](../interfaces/SponsorChoiceEffects.md) \| `null`

### outcome

> **outcome**: `string` \| `null`

### state

> **state**: [`SponsorState`](../interfaces/SponsorState.md)

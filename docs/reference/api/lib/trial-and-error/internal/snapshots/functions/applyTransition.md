[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/snapshots](../README.md) / applyTransition

# Function: applyTransition()

> **applyTransition**(`snapshot`, `transition`): [`TransitionOutcome`](../type-aliases/TransitionOutcome.md)

Applies one transition to a snapshot and returns the next version. Pure:
the input snapshot is never modified, so every earlier version stays
available for audit. A transition that names an unknown subject, or that
would change no membership, is refused.

## Parameters

### snapshot

#### capturedAt

`string` = `...`

#### id

`string` = `identifier`

#### subjects

`object`[] = `...`

#### version

`number` = `...`

### transition

#### change

`"JOIN"` \| `"LEAVE"` = `...`

#### description

`string` = `...`

What happened, in the study's words.

#### effectiveAt

`string` = `...`

#### id

`string` = `identifier`

#### populations

(`"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"`)[] = `...`

#### reason

`"DROPOUT"` \| `"PROTOCOL_AMENDMENT"` \| `"SCREEN_FAILURE"` \| `"PROTOCOL_DEVIATION"` = `TransitionReasonSchema`

#### subjectId

`string` = `identifier`

## Returns

[`TransitionOutcome`](../type-aliases/TransitionOutcome.md)

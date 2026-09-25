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

`"JOIN"` \| `"LEAVE"` \| `"ENROLL"` = `...`

ENROLL adds `subject`, a subject the snapshot does not hold yet.

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

`"DROPOUT"` \| `"PROTOCOL_AMENDMENT"` \| `"SCREEN_FAILURE"` \| `"PROTOCOL_DEVIATION"` \| `"SITE_ACTIVATION"` = `TransitionReasonSchema`

#### subject?

\{ `adverseEvents?`: `object`[]; `age`: `number`; `arm`: `"PLACEBO"` \| `"ACTIVE"`; `id`: `string`; `populations`: (`"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"`)[]; `sex`: `"F"` \| `"M"`; \} = `...`

The subject an ENROLL transition adds.

#### subject.adverseEvents?

`object`[] = `...`

Treatment-emergent adverse events. Absent means none were reported.

#### subject.age

`number` = `...`

#### subject.arm

`"PLACEBO"` \| `"ACTIVE"` = `ArmSchema`

#### subject.id

`string` = `identifier`

#### subject.populations

(`"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"`)[] = `...`

#### subject.sex

`"F"` \| `"M"` = `...`

#### subjectId

`string` = `identifier`

## Returns

[`TransitionOutcome`](../type-aliases/TransitionOutcome.md)

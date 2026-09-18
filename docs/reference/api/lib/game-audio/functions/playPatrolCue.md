[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/game-audio](../README.md) / playPatrolCue

# Function: playPatrolCue()

> **playPatrolCue**(`name`): `boolean`

Play a single Patrol Shift cue through the shared SoundEngine.

No-ops when sound is disallowed (muted, reduced motion, forced colors, or no
Web Audio support), so callers never need to guard the call site themselves.
Playback failures are swallowed: audio is optional polish and must never
block a shift from advancing.

## Parameters

### name

[`PatrolSoundName`](../type-aliases/PatrolSoundName.md)

The patrol cue to play.

## Returns

`boolean`

True when the cue was handed to the SoundEngine, false when suppressed or failed.

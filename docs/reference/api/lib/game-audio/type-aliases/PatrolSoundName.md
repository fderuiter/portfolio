[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/game-audio](../README.md) / PatrolSoundName

# Type Alias: PatrolSoundName

> **PatrolSoundName** = `"radioChirp"` \| `"radioStatic"` \| `"chairliftHum"` \| `"skiOnSnow"` \| `"sledMovement"` \| `"patrolRoomAmbience"`

Sparse operational cues for the Patrol Shift simulation.

Radio traffic in Patrol Shift is text-first: these cues are effects layered
beneath the dispatch text, never a replacement for it. Playback is delegated
to the shared SoundEngine, which is muted by default and gates every cue
through its own reduced-motion / forced-colors bypass checks.

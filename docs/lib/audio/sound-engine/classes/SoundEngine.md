[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/audio/sound-engine](../README.md) / SoundEngine

# Class: SoundEngine

Defined in: [lib/audio/sound-engine.ts:84](https://github.com/fderuiter/portfolio/blob/main/lib/audio/sound-engine.ts#L84)

## Constructors

### Constructor

> **new SoundEngine**(`options?`): `SoundEngine`

Defined in: [lib/audio/sound-engine.ts:92](https://github.com/fderuiter/portfolio/blob/main/lib/audio/sound-engine.ts#L92)

#### Parameters

##### options?

[`SoundEngineOptions`](../interfaces/SoundEngineOptions.md) = `{}`

#### Returns

`SoundEngine`

## Methods

### close()

> **close**(): `void`

Defined in: [lib/audio/sound-engine.ts:571](https://github.com/fderuiter/portfolio/blob/main/lib/audio/sound-engine.ts#L571)

Closes and disposes of AudioContext resources.

#### Returns

`void`

***

### getAudioContext()

> **getAudioContext**(): `AudioContext` \| `null`

Defined in: [lib/audio/sound-engine.ts:149](https://github.com/fderuiter/portfolio/blob/main/lib/audio/sound-engine.ts#L149)

Lazily resolves or instantiates the active AudioContext.

#### Returns

`AudioContext` \| `null`

***

### getVolume()

> **getVolume**(): `number`

Defined in: [lib/audio/sound-engine.ts:183](https://github.com/fderuiter/portfolio/blob/main/lib/audio/sound-engine.ts#L183)

Returns current master volume (0.0 to 1.0).

#### Returns

`number`

***

### isBypassActive()

> **isBypassActive**(): `boolean`

Defined in: [lib/audio/sound-engine.ts:240](https://github.com/fderuiter/portfolio/blob/main/lib/audio/sound-engine.ts#L240)

Checks if user has enabled OS or browser-level accessibility bypasses
(e.g. forced-colors, high-contrast, or prefers-reduced-motion).

#### Returns

`boolean`

***

### isMuted()

> **isMuted**(): `boolean`

Defined in: [lib/audio/sound-engine.ts:203](https://github.com/fderuiter/portfolio/blob/main/lib/audio/sound-engine.ts#L203)

Returns current mute status.

#### Returns

`boolean`

***

### isSoundAllowed()

> **isSoundAllowed**(): `boolean`

Defined in: [lib/audio/sound-engine.ts:273](https://github.com/fderuiter/portfolio/blob/main/lib/audio/sound-engine.ts#L273)

Returns whether sound playback is currently permitted.

#### Returns

`boolean`

***

### playNoise()

> **playNoise**(`options`): `void`

Defined in: [lib/audio/sound-engine.ts:465](https://github.com/fderuiter/portfolio/blob/main/lib/audio/sound-engine.ts#L465)

Synthesizes and plays procedural white noise with optional filter resonance.

#### Parameters

##### options

[`NoiseOptions`](../interfaces/NoiseOptions.md)

#### Returns

`void`

***

### playSequence()

> **playSequence**(`notes`, `options?`): [`SequenceHandle`](../interfaces/SequenceHandle.md)

Defined in: [lib/audio/sound-engine.ts:414](https://github.com/fderuiter/portfolio/blob/main/lib/audio/sound-engine.ts#L414)

Plays an ordered sequence or arpeggio of notes.

#### Parameters

##### notes

[`SequenceNote`](../interfaces/SequenceNote.md)[]

##### options?

[`SequenceOptions`](../interfaces/SequenceOptions.md) = `{}`

#### Returns

[`SequenceHandle`](../interfaces/SequenceHandle.md)

***

### playTone()

#### Call Signature

> **playTone**(`options`): `void`

Defined in: [lib/audio/sound-engine.ts:295](https://github.com/fderuiter/portfolio/blob/main/lib/audio/sound-engine.ts#L295)

Synthesizes and plays a customizable frequency pulse.

##### Parameters

###### options

[`ToneOptions`](../interfaces/ToneOptions.md)

##### Returns

`void`

#### Call Signature

> **playTone**(`frequency`, `duration?`, `type?`, `volume?`, `pan?`): `void`

Defined in: [lib/audio/sound-engine.ts:296](https://github.com/fderuiter/portfolio/blob/main/lib/audio/sound-engine.ts#L296)

Synthesizes and plays a customizable frequency pulse.

##### Parameters

###### frequency

`number`

###### duration?

`number`

###### type?

`OscillatorType`

###### volume?

`number`

###### pan?

`number`

##### Returns

`void`

***

### setMuted()

> **setMuted**(`muted`): `void`

Defined in: [lib/audio/sound-engine.ts:210](https://github.com/fderuiter/portfolio/blob/main/lib/audio/sound-engine.ts#L210)

Sets mute status, persists to storage, and halts active audio on mute.

#### Parameters

##### muted

`boolean`

#### Returns

`void`

***

### setVolume()

> **setVolume**(`v`): `void`

Defined in: [lib/audio/sound-engine.ts:190](https://github.com/fderuiter/portfolio/blob/main/lib/audio/sound-engine.ts#L190)

Sets master volume, clamps between 0 and 1, and persists to storage.

#### Parameters

##### v

`number`

#### Returns

`void`

***

### stopAll()

> **stopAll**(): `void`

Defined in: [lib/audio/sound-engine.ts:546](https://github.com/fderuiter/portfolio/blob/main/lib/audio/sound-engine.ts#L546)

Immediately halts all active playing oscillators, noise sources, and sequence timers.

#### Returns

`void`

***

### toggleMute()

> **toggleMute**(): `boolean`

Defined in: [lib/audio/sound-engine.ts:230](https://github.com/fderuiter/portfolio/blob/main/lib/audio/sound-engine.ts#L230)

Toggles mute status and returns the next value.

#### Returns

`boolean`

***

### trackSource()

> **trackSource**\<`T`\>(`source`): `T`

Defined in: [lib/audio/sound-engine.ts:280](https://github.com/fderuiter/portfolio/blob/main/lib/audio/sound-engine.ts#L280)

Tracks an active audio source node for unified lifecycle governance and immediate stopAll() termination.

#### Type Parameters

##### T

`T` *extends* `AudioScheduledSourceNode`

#### Parameters

##### source

`T`

#### Returns

`T`

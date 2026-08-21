[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/audio/sound-engine](../README.md) / ToneOptions

# Interface: ToneOptions

Defined in: [lib/audio/sound-engine.ts:21](https://github.com/fderuiter/portfolio/blob/main/lib/audio/sound-engine.ts#L21)

## Properties

### attack?

> `optional` **attack?**: `number`

Defined in: [lib/audio/sound-engine.ts:33](https://github.com/fderuiter/portfolio/blob/main/lib/audio/sound-engine.ts#L33)

Attack time in seconds (linear ramp up)

***

### decay?

> `optional` **decay?**: `number`

Defined in: [lib/audio/sound-engine.ts:35](https://github.com/fderuiter/portfolio/blob/main/lib/audio/sound-engine.ts#L35)

Decay time in seconds (linear ramp down to sustain level)

***

### duration?

> `optional` **duration?**: `number`

Defined in: [lib/audio/sound-engine.ts:25](https://github.com/fderuiter/portfolio/blob/main/lib/audio/sound-engine.ts#L25)

Duration in seconds (e.g. 0.1 for 100ms)

***

### frequency

> **frequency**: `number`

Defined in: [lib/audio/sound-engine.ts:23](https://github.com/fderuiter/portfolio/blob/main/lib/audio/sound-engine.ts#L23)

Frequency in Hz (e.g. 440 for A4)

***

### pan?

> `optional` **pan?**: `number`

Defined in: [lib/audio/sound-engine.ts:31](https://github.com/fderuiter/portfolio/blob/main/lib/audio/sound-engine.ts#L31)

Stereo pan position (-1.0 to 1.0, where -1 is full left, 1 is full right)

***

### release?

> `optional` **release?**: `number`

Defined in: [lib/audio/sound-engine.ts:39](https://github.com/fderuiter/portfolio/blob/main/lib/audio/sound-engine.ts#L39)

Release time in seconds (linear ramp to 0)

***

### sustain?

> `optional` **sustain?**: `number`

Defined in: [lib/audio/sound-engine.ts:37](https://github.com/fderuiter/portfolio/blob/main/lib/audio/sound-engine.ts#L37)

Sustain volume level multiplier (0.0 to 1.0)

***

### type?

> `optional` **type?**: `OscillatorType`

Defined in: [lib/audio/sound-engine.ts:27](https://github.com/fderuiter/portfolio/blob/main/lib/audio/sound-engine.ts#L27)

Oscillator waveform type

***

### volume?

> `optional` **volume?**: `number`

Defined in: [lib/audio/sound-engine.ts:29](https://github.com/fderuiter/portfolio/blob/main/lib/audio/sound-engine.ts#L29)

Tone-specific volume gain multiplier (0.0 to 1.0, default: 0.5)

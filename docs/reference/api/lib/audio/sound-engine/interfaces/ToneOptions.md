[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/audio/sound-engine](../README.md) / ToneOptions

# Interface: ToneOptions

## Properties

### attack?

> `optional` **attack?**: `number`

Attack time in seconds (linear ramp up)

***

### decay?

> `optional` **decay?**: `number`

Decay time in seconds (linear ramp down to sustain level)

***

### duration?

> `optional` **duration?**: `number`

Duration in seconds (e.g. 0.1 for 100ms)

***

### frequency

> **frequency**: `number`

Frequency in Hz (e.g. 440 for A4)

***

### pan?

> `optional` **pan?**: `number`

Stereo pan position (-1.0 to 1.0, where -1 is full left, 1 is full right)

***

### release?

> `optional` **release?**: `number`

Release time in seconds (linear ramp to 0)

***

### sustain?

> `optional` **sustain?**: `number`

Sustain volume level multiplier (0.0 to 1.0)

***

### type?

> `optional` **type?**: `OscillatorType`

Oscillator waveform type

***

### volume?

> `optional` **volume?**: `number`

Tone-specific volume gain multiplier (0.0 to 1.0, default: 0.5)

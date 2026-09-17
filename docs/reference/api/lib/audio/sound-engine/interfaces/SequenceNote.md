[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/audio/sound-engine](../README.md) / SequenceNote

# Interface: SequenceNote

## Properties

### delay?

> `optional` **delay?**: `number`

Delay in seconds before playing this note (relative to sequence start)

***

### duration

> **duration**: `number`

Note duration in seconds

***

### endFrequency?

> `optional` **endFrequency?**: `number`

Target frequency in Hz at note end for pitch sweeps

***

### frequency

> **frequency**: `number`

Frequency in Hz

***

### pan?

> `optional` **pan?**: `number`

Stereo pan position (-1.0 to 1.0)

***

### rampType?

> `optional` **rampType?**: `"exponential"` \| `"linear"`

Ramp curve type for endFrequency

***

### type?

> `optional` **type?**: `OscillatorType`

Specific oscillator waveform type for this note

***

### volume?

> `optional` **volume?**: `number`

Note volume multiplier (0.0 to 1.0)

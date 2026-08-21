[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/audio/sound-engine](../README.md) / SoundEngineOptions

# Interface: SoundEngineOptions

Defined in: [lib/audio/sound-engine.ts:10](https://github.com/fderuiter/portfolio/blob/main/lib/audio/sound-engine.ts#L10)

## Properties

### audioContext?

> `optional` **audioContext?**: `AudioContext` \| `null`

Defined in: [lib/audio/sound-engine.ts:18](https://github.com/fderuiter/portfolio/blob/main/lib/audio/sound-engine.ts#L18)

Custom AudioContext constructor or instance (useful for dependency injection in testing)

***

### initialMuted?

> `optional` **initialMuted?**: `boolean`

Defined in: [lib/audio/sound-engine.ts:14](https://github.com/fderuiter/portfolio/blob/main/lib/audio/sound-engine.ts#L14)

Initial mute state. If omitted, loads from storage or defaults to true

***

### initialVolume?

> `optional` **initialVolume?**: `number`

Defined in: [lib/audio/sound-engine.ts:12](https://github.com/fderuiter/portfolio/blob/main/lib/audio/sound-engine.ts#L12)

Initial volume level (0.0 to 1.0). If omitted, loads from storage or defaults to 0.3

***

### storage?

> `optional` **storage?**: `Storage` \| `null`

Defined in: [lib/audio/sound-engine.ts:16](https://github.com/fderuiter/portfolio/blob/main/lib/audio/sound-engine.ts#L16)

Custom storage provider (defaults to globalThis.localStorage when available)

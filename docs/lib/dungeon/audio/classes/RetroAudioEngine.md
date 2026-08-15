[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dungeon/audio](../README.md) / RetroAudioEngine

# Class: RetroAudioEngine

Defined in: lib/dungeon/audio.ts:6

Procedural Web Audio API 8-Bit Chiptune Sound Synthesizer
Safe for SSR, Node, and headless test environments.

## Constructors

### Constructor

> **new RetroAudioEngine**(): `RetroAudioEngine`

#### Returns

`RetroAudioEngine`

## Methods

### getMuted()

> **getMuted**(): `boolean`

Defined in: lib/dungeon/audio.ts:30

#### Returns

`boolean`

***

### playAlertPulse()

> **playAlertPulse**(): `void`

Defined in: lib/dungeon/audio.ts:152

Security Alert / IDS alarm pulse.

#### Returns

`void`

***

### playCriticalHit()

> **playCriticalHit**(): `void`

Defined in: lib/dungeon/audio.ts:131

Critical CVE hit arpeggio.

#### Returns

`void`

***

### playExploitBlast()

> **playExploitBlast**(): `void`

Defined in: lib/dungeon/audio.ts:104

High-impact Exploit blast sound.

#### Returns

`void`

***

### playHackSuccess()

> **playHackSuccess**(): `void`

Defined in: lib/dungeon/audio.ts:140

Hex terminal bypass success fanfare.

#### Returns

`void`

***

### playPickup()

> **playPickup**(): `void`

Defined in: lib/dungeon/audio.ts:160

Item / Crypto pickup chime.

#### Returns

`void`

***

### playPortScan()

> **playPortScan**(): `void`

Defined in: lib/dungeon/audio.ts:77

Port Scan frequency ramp.

#### Returns

`void`

***

### playStep()

> **playStep**(): `void`

Defined in: lib/dungeon/audio.ts:70

Subnet step movement blip.

#### Returns

`void`

***

### playTone()

> **playTone**(`freq`, `durationMs?`, `type?`, `volume?`): `void`

Defined in: lib/dungeon/audio.ts:37

Plays a customizable synthesized frequency pulse.

#### Parameters

##### freq

`number`

##### durationMs?

`number` = `80`

##### type?

`OscillatorType` = `"square"`

##### volume?

`number` = `0.08`

#### Returns

`void`

***

### setMuted()

> **setMuted**(`muted`): `void`

Defined in: lib/dungeon/audio.ts:26

#### Parameters

##### muted

`boolean`

#### Returns

`void`

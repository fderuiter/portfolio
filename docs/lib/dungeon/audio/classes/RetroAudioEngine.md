[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dungeon/audio](../README.md) / RetroAudioEngine

# Class: RetroAudioEngine

Defined in: [lib/dungeon/audio.ts:19](https://github.com/fderuiter/portfolio/blob/main/lib/dungeon/audio.ts#L19)

## Constructors

### Constructor

> **new RetroAudioEngine**(): `RetroAudioEngine`

#### Returns

`RetroAudioEngine`

## Methods

### getMuted()

> **getMuted**(): `boolean`

Defined in: [lib/dungeon/audio.ts:58](https://github.com/fderuiter/portfolio/blob/main/lib/dungeon/audio.ts#L58)

#### Returns

`boolean`

***

### playAlertPulse()

> **playAlertPulse**(): `void`

Defined in: [lib/dungeon/audio.ts:185](https://github.com/fderuiter/portfolio/blob/main/lib/dungeon/audio.ts#L185)

Security Alert / IDS alarm pulse.

#### Returns

`void`

***

### playCriticalHit()

> **playCriticalHit**(): `void`

Defined in: [lib/dungeon/audio.ts:164](https://github.com/fderuiter/portfolio/blob/main/lib/dungeon/audio.ts#L164)

Critical CVE hit arpeggio.

#### Returns

`void`

***

### playExploitBlast()

> **playExploitBlast**(): `void`

Defined in: [lib/dungeon/audio.ts:136](https://github.com/fderuiter/portfolio/blob/main/lib/dungeon/audio.ts#L136)

High-impact Exploit blast sound.

#### Returns

`void`

***

### playHackSuccess()

> **playHackSuccess**(): `void`

Defined in: [lib/dungeon/audio.ts:173](https://github.com/fderuiter/portfolio/blob/main/lib/dungeon/audio.ts#L173)

Hex terminal bypass success fanfare.

#### Returns

`void`

***

### playPickup()

> **playPickup**(): `void`

Defined in: [lib/dungeon/audio.ts:193](https://github.com/fderuiter/portfolio/blob/main/lib/dungeon/audio.ts#L193)

Item / Crypto pickup chime.

#### Returns

`void`

***

### playPortScan()

> **playPortScan**(): `void`

Defined in: [lib/dungeon/audio.ts:108](https://github.com/fderuiter/portfolio/blob/main/lib/dungeon/audio.ts#L108)

Port Scan frequency ramp.

#### Returns

`void`

***

### playStep()

> **playStep**(): `void`

Defined in: [lib/dungeon/audio.ts:101](https://github.com/fderuiter/portfolio/blob/main/lib/dungeon/audio.ts#L101)

Subnet step movement blip.

#### Returns

`void`

***

### playTone()

> **playTone**(`freq`, `durationMs?`, `type?`, `volume?`): `void`

Defined in: [lib/dungeon/audio.ts:65](https://github.com/fderuiter/portfolio/blob/main/lib/dungeon/audio.ts#L65)

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

Defined in: [lib/dungeon/audio.ts:51](https://github.com/fderuiter/portfolio/blob/main/lib/dungeon/audio.ts#L51)

#### Parameters

##### muted

`boolean`

#### Returns

`void`

***

### stopAll()

> **stopAll**(): `void`

Defined in: [lib/dungeon/audio.ts:41](https://github.com/fderuiter/portfolio/blob/main/lib/dungeon/audio.ts#L41)

#### Returns

`void`

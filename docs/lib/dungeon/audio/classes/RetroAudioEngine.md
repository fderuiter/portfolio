[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dungeon/audio](../README.md) / RetroAudioEngine

# Class: RetroAudioEngine

Defined in: [lib/dungeon/audio.ts:9](https://github.com/fderuiter/portfolio/blob/main/lib/dungeon/audio.ts#L9)

## Constructors

### Constructor

> **new RetroAudioEngine**(`engine?`): `RetroAudioEngine`

Defined in: [lib/dungeon/audio.ts:13](https://github.com/fderuiter/portfolio/blob/main/lib/dungeon/audio.ts#L13)

#### Parameters

##### engine?

[`SoundEngine`](../../../audio/sound-engine/classes/SoundEngine.md) = `...`

#### Returns

`RetroAudioEngine`

## Methods

### getMuted()

> **getMuted**(): `boolean`

Defined in: [lib/dungeon/audio.ts:36](https://github.com/fderuiter/portfolio/blob/main/lib/dungeon/audio.ts#L36)

#### Returns

`boolean`

***

### playAlertPulse()

> **playAlertPulse**(): `void`

Defined in: [lib/dungeon/audio.ts:163](https://github.com/fderuiter/portfolio/blob/main/lib/dungeon/audio.ts#L163)

Security Alert / IDS alarm pulse.

#### Returns

`void`

***

### playCriticalHit()

> **playCriticalHit**(): `void`

Defined in: [lib/dungeon/audio.ts:142](https://github.com/fderuiter/portfolio/blob/main/lib/dungeon/audio.ts#L142)

Critical CVE hit arpeggio.

#### Returns

`void`

***

### playExploitBlast()

> **playExploitBlast**(): `void`

Defined in: [lib/dungeon/audio.ts:114](https://github.com/fderuiter/portfolio/blob/main/lib/dungeon/audio.ts#L114)

High-impact Exploit blast sound.

#### Returns

`void`

***

### playHackSuccess()

> **playHackSuccess**(): `void`

Defined in: [lib/dungeon/audio.ts:151](https://github.com/fderuiter/portfolio/blob/main/lib/dungeon/audio.ts#L151)

Hex terminal bypass success fanfare.

#### Returns

`void`

***

### playPickup()

> **playPickup**(): `void`

Defined in: [lib/dungeon/audio.ts:171](https://github.com/fderuiter/portfolio/blob/main/lib/dungeon/audio.ts#L171)

Item / Crypto pickup chime.

#### Returns

`void`

***

### playPortScan()

> **playPortScan**(): `void`

Defined in: [lib/dungeon/audio.ts:86](https://github.com/fderuiter/portfolio/blob/main/lib/dungeon/audio.ts#L86)

Port Scan frequency ramp.

#### Returns

`void`

***

### playStep()

> **playStep**(): `void`

Defined in: [lib/dungeon/audio.ts:79](https://github.com/fderuiter/portfolio/blob/main/lib/dungeon/audio.ts#L79)

Subnet step movement blip.

#### Returns

`void`

***

### playTone()

> **playTone**(`freq`, `durationMs?`, `type?`, `volume?`): `void`

Defined in: [lib/dungeon/audio.ts:43](https://github.com/fderuiter/portfolio/blob/main/lib/dungeon/audio.ts#L43)

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

Defined in: [lib/dungeon/audio.ts:29](https://github.com/fderuiter/portfolio/blob/main/lib/dungeon/audio.ts#L29)

#### Parameters

##### muted

`boolean`

#### Returns

`void`

***

### stopAll()

> **stopAll**(): `void`

Defined in: [lib/dungeon/audio.ts:25](https://github.com/fderuiter/portfolio/blob/main/lib/dungeon/audio.ts#L25)

#### Returns

`void`

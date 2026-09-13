[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dungeon/audio](../README.md) / RetroAudioEngine

# Class: RetroAudioEngine

## Constructors

### Constructor

> **new RetroAudioEngine**(`engine?`): `RetroAudioEngine`

#### Parameters

##### engine?

[`SoundEngine`](../../../audio/sound-engine/classes/SoundEngine.md) = `...`

#### Returns

`RetroAudioEngine`

## Methods

### getMuted()

> **getMuted**(): `boolean`

#### Returns

`boolean`

***

### playAlertPulse()

> **playAlertPulse**(): `void`

Security Alert / IDS alarm pulse.

#### Returns

`void`

***

### playCriticalHit()

> **playCriticalHit**(): `void`

Critical CVE hit arpeggio.

#### Returns

`void`

***

### playExploitBlast()

> **playExploitBlast**(): `void`

High-impact Exploit blast sound.

#### Returns

`void`

***

### playHackSuccess()

> **playHackSuccess**(): `void`

Hex terminal bypass success fanfare.

#### Returns

`void`

***

### playPickup()

> **playPickup**(): `void`

Item / Crypto pickup chime.

#### Returns

`void`

***

### playPortScan()

> **playPortScan**(): `void`

Port Scan frequency ramp.

#### Returns

`void`

***

### playStep()

> **playStep**(): `void`

Subnet step movement blip.

#### Returns

`void`

***

### playTone()

> **playTone**(`freq`, `durationMs?`, `type?`, `volume?`): `void`

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

#### Parameters

##### muted

`boolean`

#### Returns

`void`

***

### stopAll()

> **stopAll**(): `void`

#### Returns

`void`

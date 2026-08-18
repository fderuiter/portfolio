[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/laser-loon/types](../README.md) / LaserLoonState

# Interface: LaserLoonState

Defined in: [lib/laser-loon/types.ts:167](https://github.com/fderuiter/portfolio/blob/main/lib/laser-loon/types.ts#L167)

## Properties

### activePowerUp

> **activePowerUp**: \{ `remainingMs`: `number`; `type`: [`PowerUpType`](../type-aliases/PowerUpType.md); \} \| `null`

Defined in: [lib/laser-loon/types.ts:180](https://github.com/fderuiter/portfolio/blob/main/lib/laser-loon/types.ts#L180)

***

### actKills

> **actKills**: `number`

Defined in: [lib/laser-loon/types.ts:172](https://github.com/fderuiter/portfolio/blob/main/lib/laser-loon/types.ts#L172)

***

### aimPos

> **aimPos**: `object`

Defined in: [lib/laser-loon/types.ts:188](https://github.com/fderuiter/portfolio/blob/main/lib/laser-loon/types.ts#L188)

#### x

> **x**: `number`

#### y

> **y**: `number`

***

### combo

> **combo**: `number`

Defined in: [lib/laser-loon/types.ts:175](https://github.com/fderuiter/portfolio/blob/main/lib/laser-loon/types.ts#L175)

***

### currentAct

> **currentAct**: `number`

Defined in: [lib/laser-loon/types.ts:171](https://github.com/fderuiter/portfolio/blob/main/lib/laser-loon/types.ts#L171)

***

### floatingTexts

> **floatingTexts**: [`FloatingText`](FloatingText.md)[]

Defined in: [lib/laser-loon/types.ts:186](https://github.com/fderuiter/portfolio/blob/main/lib/laser-loon/types.ts#L186)

***

### gameState

> **gameState**: `"playing"` \| `"idle"` \| `"story-modal"` \| `"gameover"` \| `"victory"`

Defined in: [lib/laser-loon/types.ts:170](https://github.com/fderuiter/portfolio/blob/main/lib/laser-loon/types.ts#L170)

***

### gravity

> **gravity**: `number`

Defined in: [lib/laser-loon/types.ts:178](https://github.com/fderuiter/portfolio/blob/main/lib/laser-loon/types.ts#L178)

***

### highScore

> **highScore**: `number`

Defined in: [lib/laser-loon/types.ts:174](https://github.com/fderuiter/portfolio/blob/main/lib/laser-loon/types.ts#L174)

***

### iceBlocks

> **iceBlocks**: [`IceBlock`](IceBlock.md)[]

Defined in: [lib/laser-loon/types.ts:182](https://github.com/fderuiter/portfolio/blob/main/lib/laser-loon/types.ts#L182)

***

### laserType

> **laserType**: [`LaserType`](../type-aliases/LaserType.md)

Defined in: [lib/laser-loon/types.ts:169](https://github.com/fderuiter/portfolio/blob/main/lib/laser-loon/types.ts#L169)

***

### lastComboTime

> **lastComboTime**: `number`

Defined in: [lib/laser-loon/types.ts:190](https://github.com/fderuiter/portfolio/blob/main/lib/laser-loon/types.ts#L190)

***

### lastFireTime

> **lastFireTime**: `number`

Defined in: [lib/laser-loon/types.ts:189](https://github.com/fderuiter/portfolio/blob/main/lib/laser-loon/types.ts#L189)

***

### loonPos

> **loonPos**: [`LoonPosition`](LoonPosition.md)

Defined in: [lib/laser-loon/types.ts:187](https://github.com/fderuiter/portfolio/blob/main/lib/laser-loon/types.ts#L187)

***

### mode

> **mode**: [`LaserMode`](../type-aliases/LaserMode.md)

Defined in: [lib/laser-loon/types.ts:168](https://github.com/fderuiter/portfolio/blob/main/lib/laser-loon/types.ts#L168)

***

### multiplier

> **multiplier**: `number`

Defined in: [lib/laser-loon/types.ts:176](https://github.com/fderuiter/portfolio/blob/main/lib/laser-loon/types.ts#L176)

***

### nextIceId

> **nextIceId**: `number`

Defined in: [lib/laser-loon/types.ts:192](https://github.com/fderuiter/portfolio/blob/main/lib/laser-loon/types.ts#L192)

***

### nextPowerUpId

> **nextPowerUpId**: `number`

Defined in: [lib/laser-loon/types.ts:193](https://github.com/fderuiter/portfolio/blob/main/lib/laser-loon/types.ts#L193)

***

### nextShockwaveId

> **nextShockwaveId**: `number`

Defined in: [lib/laser-loon/types.ts:194](https://github.com/fderuiter/portfolio/blob/main/lib/laser-loon/types.ts#L194)

***

### nextTargetId

> **nextTargetId**: `number`

Defined in: [lib/laser-loon/types.ts:191](https://github.com/fderuiter/portfolio/blob/main/lib/laser-loon/types.ts#L191)

***

### nextTextId

> **nextTextId**: `number`

Defined in: [lib/laser-loon/types.ts:195](https://github.com/fderuiter/portfolio/blob/main/lib/laser-loon/types.ts#L195)

***

### particles

> **particles**: [`Particle`](Particle.md)[]

Defined in: [lib/laser-loon/types.ts:184](https://github.com/fderuiter/portfolio/blob/main/lib/laser-loon/types.ts#L184)

***

### powerUps

> **powerUps**: [`PowerUp`](PowerUp.md)[]

Defined in: [lib/laser-loon/types.ts:183](https://github.com/fderuiter/portfolio/blob/main/lib/laser-loon/types.ts#L183)

***

### score

> **score**: `number`

Defined in: [lib/laser-loon/types.ts:173](https://github.com/fderuiter/portfolio/blob/main/lib/laser-loon/types.ts#L173)

***

### shakeIntensity

> **shakeIntensity**: `number`

Defined in: [lib/laser-loon/types.ts:196](https://github.com/fderuiter/portfolio/blob/main/lib/laser-loon/types.ts#L196)

***

### shockwaves

> **shockwaves**: [`Shockwave`](Shockwave.md)[]

Defined in: [lib/laser-loon/types.ts:185](https://github.com/fderuiter/portfolio/blob/main/lib/laser-loon/types.ts#L185)

***

### targets

> **targets**: [`Target`](Target.md)[]

Defined in: [lib/laser-loon/types.ts:181](https://github.com/fderuiter/portfolio/blob/main/lib/laser-loon/types.ts#L181)

***

### timeLeft

> **timeLeft**: `number`

Defined in: [lib/laser-loon/types.ts:177](https://github.com/fderuiter/portfolio/blob/main/lib/laser-loon/types.ts#L177)

***

### ultimateMeter

> **ultimateMeter**: `number`

Defined in: [lib/laser-loon/types.ts:179](https://github.com/fderuiter/portfolio/blob/main/lib/laser-loon/types.ts#L179)

[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/laser-loon/types](../README.md) / LaserLoonState

# Interface: LaserLoonState

## Properties

### activePowerUp

> **activePowerUp**: \{ `remainingMs`: `number`; `type`: [`PowerUpType`](../type-aliases/PowerUpType.md); \} \| `null`

***

### actKills

> **actKills**: `number`

***

### aimPos

> **aimPos**: `object`

#### x

> **x**: `number`

#### y

> **y**: `number`

***

### combo

> **combo**: `number`

***

### currentAct

> **currentAct**: `number`

***

### floatingTexts

> **floatingTexts**: [`FloatingText`](FloatingText.md)[]

***

### gameState

> **gameState**: `"idle"` \| `"playing"` \| `"story-modal"` \| `"gameover"` \| `"victory"`

***

### gravity

> **gravity**: `number`

***

### highScore

> **highScore**: `number`

***

### iceBlocks

> **iceBlocks**: [`IceBlock`](IceBlock.md)[]

***

### laserType

> **laserType**: [`LaserType`](../type-aliases/LaserType.md)

***

### lastComboTime

> **lastComboTime**: `number`

***

### lastFireTime

> **lastFireTime**: `number`

***

### loonPos

> **loonPos**: [`LoonPosition`](LoonPosition.md)

***

### mode

> **mode**: [`LaserMode`](../type-aliases/LaserMode.md)

***

### multiplier

> **multiplier**: `number`

***

### nextIceId

> **nextIceId**: `number`

***

### nextPowerUpId

> **nextPowerUpId**: `number`

***

### nextShockwaveId

> **nextShockwaveId**: `number`

***

### nextTargetId

> **nextTargetId**: `number`

***

### nextTextId

> **nextTextId**: `number`

***

### particles

> **particles**: [`Particle`](Particle.md)[]

***

### powerUps

> **powerUps**: [`PowerUp`](PowerUp.md)[]

***

### score

> **score**: `number`

***

### shakeIntensity

> **shakeIntensity**: `number`

***

### shockwaves

> **shockwaves**: [`Shockwave`](Shockwave.md)[]

***

### targets

> **targets**: [`Target`](Target.md)[]

***

### timeLeft

> **timeLeft**: `number`

***

### ultimateMeter

> **ultimateMeter**: `number`

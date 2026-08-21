[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/garmin-engine](../README.md) / GameEngineState

# Interface: GameEngineState

Defined in: [lib/garmin-engine.ts:157](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L157)

## Properties

### allocatedFlashKb

> **allocatedFlashKb**: `number`

Defined in: [lib/garmin-engine.ts:170](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L170)

***

### allocatedRamKb

> **allocatedRamKb**: `number`

Defined in: [lib/garmin-engine.ts:167](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L167)

***

### battery

> **battery**: `number`

Defined in: [lib/garmin-engine.ts:173](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L173)

***

### consecutiveDodges

> **consecutiveDodges**: `number`

Defined in: [lib/garmin-engine.ts:184](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L184)

***

### crashReport

> **crashReport**: [`CrashReport`](CrashReport.md) \| `null`

Defined in: [lib/garmin-engine.ts:181](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L181)

***

### device

> **device**: [`DeviceTarget`](../type-aliases/DeviceTarget.md)

Defined in: [lib/garmin-engine.ts:159](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L159)

***

### distanceMeters

> **distanceMeters**: `number`

Defined in: [lib/garmin-engine.ts:165](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L165)

***

### flashFiles?

> `optional` **flashFiles?**: [`FlashVariable`](FlashVariable.md)[]

Defined in: [lib/garmin-engine.ts:169](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L169)

***

### flashVariables

> **flashVariables**: [`FlashVariable`](FlashVariable.md)[]

Defined in: [lib/garmin-engine.ts:168](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L168)

***

### fogLevel

> **fogLevel**: `number`

Defined in: [lib/garmin-engine.ts:175](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L175)

***

### fogWipes

> **fogWipes**: [`FogPoint`](FogPoint.md)[]

Defined in: [lib/garmin-engine.ts:176](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L176)

***

### gameState

> **gameState**: `"idle"` \| `"playing"` \| `"paused"` \| `"crashed"` \| `"shutdown"` \| `"summary"`

Defined in: [lib/garmin-engine.ts:158](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L158)

***

### gcTimerMs

> **gcTimerMs**: `number`

Defined in: [lib/garmin-engine.ts:178](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L178)

***

### heartRate

> **heartRate**: `number`

Defined in: [lib/garmin-engine.ts:179](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L179)

***

### highScore

> **highScore**: `number`

Defined in: [lib/garmin-engine.ts:164](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L164)

***

### isGcActive

> **isGcActive**: `boolean`

Defined in: [lib/garmin-engine.ts:177](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L177)

***

### isGrounded

> **isGrounded**: `boolean`

Defined in: [lib/garmin-engine.ts:162](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L162)

***

### isLightOn

> **isLightOn**: `boolean`

Defined in: [lib/garmin-engine.ts:172](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L172)

***

### lastAllocTime

> **lastAllocTime**: `number`

Defined in: [lib/garmin-engine.ts:182](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L182)

***

### lastObstacleTime

> **lastObstacleTime**: `number`

Defined in: [lib/garmin-engine.ts:183](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L183)

***

### lightActiveDurationMs

> **lightActiveDurationMs**: `number`

Defined in: [lib/garmin-engine.ts:174](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L174)

***

### obstacles

> **obstacles**: [`Obstacle`](Obstacle.md)[]

Defined in: [lib/garmin-engine.ts:171](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L171)

***

### playerVy

> **playerVy**: `number`

Defined in: [lib/garmin-engine.ts:161](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L161)

***

### playerY

> **playerY**: `number`

Defined in: [lib/garmin-engine.ts:160](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L160)

***

### score

> **score**: `number`

Defined in: [lib/garmin-engine.ts:163](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L163)

***

### thermalStress

> **thermalStress**: `number`

Defined in: [lib/garmin-engine.ts:180](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L180)

***

### variables

> **variables**: [`MemoryVariable`](MemoryVariable.md)[]

Defined in: [lib/garmin-engine.ts:166](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L166)

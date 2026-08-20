[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/garmin-engine](../README.md) / GameEngineState

# Interface: GameEngineState

Defined in: [lib/garmin-engine.ts:150](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L150)

## Properties

### allocatedFlashKb

> **allocatedFlashKb**: `number`

Defined in: [lib/garmin-engine.ts:163](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L163)

***

### allocatedRamKb

> **allocatedRamKb**: `number`

Defined in: [lib/garmin-engine.ts:160](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L160)

***

### battery

> **battery**: `number`

Defined in: [lib/garmin-engine.ts:166](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L166)

***

### consecutiveDodges

> **consecutiveDodges**: `number`

Defined in: [lib/garmin-engine.ts:177](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L177)

***

### crashReport

> **crashReport**: [`CrashReport`](CrashReport.md) \| `null`

Defined in: [lib/garmin-engine.ts:174](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L174)

***

### device

> **device**: [`DeviceTarget`](../type-aliases/DeviceTarget.md)

Defined in: [lib/garmin-engine.ts:152](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L152)

***

### distanceMeters

> **distanceMeters**: `number`

Defined in: [lib/garmin-engine.ts:158](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L158)

***

### flashFiles?

> `optional` **flashFiles?**: [`FlashVariable`](FlashVariable.md)[]

Defined in: [lib/garmin-engine.ts:162](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L162)

***

### flashVariables

> **flashVariables**: [`FlashVariable`](FlashVariable.md)[]

Defined in: [lib/garmin-engine.ts:161](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L161)

***

### fogLevel

> **fogLevel**: `number`

Defined in: [lib/garmin-engine.ts:168](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L168)

***

### fogWipes

> **fogWipes**: [`FogPoint`](FogPoint.md)[]

Defined in: [lib/garmin-engine.ts:169](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L169)

***

### gameState

> **gameState**: `"playing"` \| `"summary"` \| `"idle"` \| `"paused"` \| `"crashed"` \| `"shutdown"`

Defined in: [lib/garmin-engine.ts:151](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L151)

***

### gcTimerMs

> **gcTimerMs**: `number`

Defined in: [lib/garmin-engine.ts:171](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L171)

***

### heartRate

> **heartRate**: `number`

Defined in: [lib/garmin-engine.ts:172](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L172)

***

### highScore

> **highScore**: `number`

Defined in: [lib/garmin-engine.ts:157](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L157)

***

### isGcActive

> **isGcActive**: `boolean`

Defined in: [lib/garmin-engine.ts:170](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L170)

***

### isGrounded

> **isGrounded**: `boolean`

Defined in: [lib/garmin-engine.ts:155](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L155)

***

### isLightOn

> **isLightOn**: `boolean`

Defined in: [lib/garmin-engine.ts:165](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L165)

***

### lastAllocTime

> **lastAllocTime**: `number`

Defined in: [lib/garmin-engine.ts:175](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L175)

***

### lastObstacleTime

> **lastObstacleTime**: `number`

Defined in: [lib/garmin-engine.ts:176](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L176)

***

### lightActiveDurationMs

> **lightActiveDurationMs**: `number`

Defined in: [lib/garmin-engine.ts:167](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L167)

***

### obstacles

> **obstacles**: [`Obstacle`](Obstacle.md)[]

Defined in: [lib/garmin-engine.ts:164](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L164)

***

### playerVy

> **playerVy**: `number`

Defined in: [lib/garmin-engine.ts:154](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L154)

***

### playerY

> **playerY**: `number`

Defined in: [lib/garmin-engine.ts:153](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L153)

***

### score

> **score**: `number`

Defined in: [lib/garmin-engine.ts:156](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L156)

***

### thermalStress

> **thermalStress**: `number`

Defined in: [lib/garmin-engine.ts:173](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L173)

***

### variables

> **variables**: [`MemoryVariable`](MemoryVariable.md)[]

Defined in: [lib/garmin-engine.ts:159](https://github.com/fderuiter/portfolio/blob/main/lib/garmin-engine.ts#L159)

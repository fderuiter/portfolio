[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/working-with-duck-engine](../README.md) / WorkingWithDuckState

# Interface: WorkingWithDuckState

Defined in: [lib/working-with-duck-engine.ts:272](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L272)

## Properties

### activeHazardTarget

> **activeHazardTarget**: [`PortfolioHazardType`](../type-aliases/PortfolioHazardType.md) \| `null`

Defined in: [lib/working-with-duck-engine.ts:321](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L321)

***

### activeSkillToast

> **activeSkillToast**: \{ `badge`: `string`; `text`: `string`; `timer`: `number`; \} \| `null`

Defined in: [lib/working-with-duck-engine.ts:346](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L346)

***

### activeSurpriseEvent

> **activeSurpriseEvent**: \{ `resolved`: `boolean`; `timer`: `number`; `type`: `"amazon-delivery"` \| `"squirrel-window"` \| `"puppy-hiccups"`; \} \| `null`

Defined in: [lib/working-with-duck-engine.ts:290](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L290)

***

### ball

> **ball**: \{ `active`: `boolean`; `vx`: `number`; `vy`: `number`; `x`: `number`; `y`: `number`; \} \| `null`

Defined in: [lib/working-with-duck-engine.ts:312](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L312)

***

### bellyRubScrubCount

> **bellyRubScrubCount**: `number`

Defined in: [lib/working-with-duck-engine.ts:286](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L286)

***

### bladder

> **bladder**: `number`

Defined in: [lib/working-with-duck-engine.ts:279](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L279)

***

### calmBuffTimer

> **calmBuffTimer**: `number`

Defined in: [lib/working-with-duck-engine.ts:284](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L284)

***

### comboStreak

> **comboStreak**: `number`

Defined in: [lib/working-with-duck-engine.ts:288](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L288)

***

### comboTimer

> **comboTimer**: `number`

Defined in: [lib/working-with-duck-engine.ts:289](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L289)

***

### currentLevel

> **currentLevel**: `number`

Defined in: [lib/working-with-duck-engine.ts:275](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L275)

***

### duck

> **duck**: `object`

Defined in: [lib/working-with-duck-engine.ts:296](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L296)

#### angle

> **angle**: `number`

#### circleAngle

> **circleAngle**: `number`

#### isCarryingBall

> **isCarryingBall**: `boolean`

#### sniffCountdown

> **sniffCountdown**: `number`

#### state

> **state**: [`DuckBehaviorState`](../type-aliases/DuckBehaviorState.md)

#### stateTimer

> **stateTimer**: `number`

#### targetX

> **targetX**: `number`

#### targetY

> **targetY**: `number`

#### vx

> **vx**: `number`

#### vy

> **vy**: `number`

#### x

> **x**: `number`

#### y

> **y**: `number`

***

### excitement

> **excitement**: `number`

Defined in: [lib/working-with-duck-engine.ts:278](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L278)

***

### floatingAlerts

> **floatingAlerts**: [`FloatingAlert`](FloatingAlert.md)[]

Defined in: [lib/working-with-duck-engine.ts:324](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L324)

***

### hazards

> **hazards**: [`PortfolioHazard`](PortfolioHazard.md)[]

Defined in: [lib/working-with-duck-engine.ts:320](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L320)

***

### highScore

> **highScore**: `number`

Defined in: [lib/working-with-duck-engine.ts:345](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L345)

***

### inDogPark

> **inDogPark**: `boolean`

Defined in: [lib/working-with-duck-engine.ts:328](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L328)

***

### lastImpulseTick

> **lastImpulseTick**: `number`

Defined in: [lib/working-with-duck-engine.ts:285](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L285)

***

### latestUnlockedFact

> **latestUnlockedFact**: [`DuckFact`](DuckFact.md) \| `null`

Defined in: [lib/working-with-duck-engine.ts:344](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L344)

***

### mode

> **mode**: `"campaign"` \| `"endless"`

Defined in: [lib/working-with-duck-engine.ts:274](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L274)

***

### multiplier

> **multiplier**: `number`

Defined in: [lib/working-with-duck-engine.ts:281](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L281)

***

### naughtyVsGood

> **naughtyVsGood**: `number`

Defined in: [lib/working-with-duck-engine.ts:280](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L280)

***

### nextAlertId

> **nextAlertId**: `number`

Defined in: [lib/working-with-duck-engine.ts:326](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L326)

***

### nextParticleId

> **nextParticleId**: `number`

Defined in: [lib/working-with-duck-engine.ts:325](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L325)

***

### parkState

> **parkState**: `object`

Defined in: [lib/working-with-duck-engine.ts:329](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L329)

#### ballVx

> **ballVx**: `number`

#### ballVy

> **ballVy**: `number`

#### ballX

> **ballX**: `number`

#### ballY

> **ballY**: `number`

#### duckAngle

> **duckAngle**: `number`

#### duckX

> **duckX**: `number`

#### duckY

> **duckY**: `number`

#### puddles

> **puddles**: [`MudPuddle`](MudPuddle.md)[]

#### status

> **status**: `"success"` \| `"aim"` \| `"thrown"` \| `"retrieving"` \| `"muddy"`

#### timer

> **timer**: `number`

#### whistleTaps

> **whistleTaps**: `number`

***

### particles

> **particles**: [`Particle`](Particle.md)[]

Defined in: [lib/working-with-duck-engine.ts:323](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L323)

***

### selectedItem

> **selectedItem**: [`InventoryItem`](../type-aliases/InventoryItem.md)

Defined in: [lib/working-with-duck-engine.ts:311](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L311)

***

### soundCueQueue

> **soundCueQueue**: [`SoundCue`](../type-aliases/SoundCue.md)[]

Defined in: [lib/working-with-duck-engine.ts:347](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L347)

***

### status

> **status**: `"idle"` \| `"paused"` \| `"running"` \| `"failed"` \| `"won"`

Defined in: [lib/working-with-duck-engine.ts:273](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L273)

***

### targetWorkProgress

> **targetWorkProgress**: `number`

Defined in: [lib/working-with-duck-engine.ts:277](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L277)

***

### ticks

> **ticks**: `number`

Defined in: [lib/working-with-duck-engine.ts:282](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L282)

***

### totalScore

> **totalScore**: `number`

Defined in: [lib/working-with-duck-engine.ts:283](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L283)

***

### unlockedFacts

> **unlockedFacts**: `number`[]

Defined in: [lib/working-with-duck-engine.ts:343](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L343)

***

### workProgress

> **workProgress**: `number`

Defined in: [lib/working-with-duck-engine.ts:276](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L276)

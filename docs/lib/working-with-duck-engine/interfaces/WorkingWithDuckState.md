[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/working-with-duck-engine](../README.md) / WorkingWithDuckState

# Interface: WorkingWithDuckState

Defined in: [lib/working-with-duck-engine.ts:284](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L284)

## Properties

### activeHazardTarget

> **activeHazardTarget**: [`PortfolioHazardType`](../type-aliases/PortfolioHazardType.md) \| `null`

Defined in: [lib/working-with-duck-engine.ts:336](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L336)

***

### activeSkillToast

> **activeSkillToast**: \{ `badge`: `string`; `text`: `string`; `timer`: `number`; \} \| `null`

Defined in: [lib/working-with-duck-engine.ts:365](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L365)

***

### activeSurpriseEvent

> **activeSurpriseEvent**: \{ `maxTimer`: `number`; `resolved`: `boolean`; `timer`: `number`; `type`: `"amazon-delivery"` \| `"squirrel-window"` \| `"puppy-hiccups"`; \} \| `null`

Defined in: [lib/working-with-duck-engine.ts:303](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L303)

***

### ball

> **ball**: \{ `active`: `boolean`; `vx`: `number`; `vy`: `number`; `x`: `number`; `y`: `number`; \} \| `null`

Defined in: [lib/working-with-duck-engine.ts:327](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L327)

***

### bellyRubProgress

> **bellyRubProgress**: `number`

Defined in: [lib/working-with-duck-engine.ts:299](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L299)

***

### bellyRubScrubCount

> **bellyRubScrubCount**: `number`

Defined in: [lib/working-with-duck-engine.ts:298](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L298)

***

### bladder

> **bladder**: `number`

Defined in: [lib/working-with-duck-engine.ts:291](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L291)

***

### calmBuffTimer

> **calmBuffTimer**: `number`

Defined in: [lib/working-with-duck-engine.ts:296](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L296)

***

### comboStreak

> **comboStreak**: `number`

Defined in: [lib/working-with-duck-engine.ts:301](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L301)

***

### comboTimer

> **comboTimer**: `number`

Defined in: [lib/working-with-duck-engine.ts:302](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L302)

***

### currentLevel

> **currentLevel**: `number`

Defined in: [lib/working-with-duck-engine.ts:287](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L287)

***

### duck

> **duck**: `object`

Defined in: [lib/working-with-duck-engine.ts:310](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L310)

#### angle

> **angle**: `number`

#### circleAngle

> **circleAngle**: `number`

#### isCarryingBall

> **isCarryingBall**: `boolean`

#### maxStateTimer

> **maxStateTimer**: `number`

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

Defined in: [lib/working-with-duck-engine.ts:290](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L290)

***

### floatingAlerts

> **floatingAlerts**: [`FloatingAlert`](FloatingAlert.md)[]

Defined in: [lib/working-with-duck-engine.ts:339](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L339)

***

### hazards

> **hazards**: [`PortfolioHazard`](PortfolioHazard.md)[]

Defined in: [lib/working-with-duck-engine.ts:335](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L335)

***

### highScore

> **highScore**: `number`

Defined in: [lib/working-with-duck-engine.ts:364](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L364)

***

### inDogPark

> **inDogPark**: `boolean`

Defined in: [lib/working-with-duck-engine.ts:343](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L343)

***

### lastImpulseTick

> **lastImpulseTick**: `number`

Defined in: [lib/working-with-duck-engine.ts:297](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L297)

***

### latestUnlockedFact

> **latestUnlockedFact**: [`DuckFact`](DuckFact.md) \| `null`

Defined in: [lib/working-with-duck-engine.ts:363](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L363)

***

### mode

> **mode**: `"campaign"` \| `"endless"`

Defined in: [lib/working-with-duck-engine.ts:286](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L286)

***

### multiplier

> **multiplier**: `number`

Defined in: [lib/working-with-duck-engine.ts:293](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L293)

***

### naughtyVsGood

> **naughtyVsGood**: `number`

Defined in: [lib/working-with-duck-engine.ts:292](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L292)

***

### nextAlertId

> **nextAlertId**: `number`

Defined in: [lib/working-with-duck-engine.ts:341](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L341)

***

### nextParticleId

> **nextParticleId**: `number`

Defined in: [lib/working-with-duck-engine.ts:340](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L340)

***

### parkState

> **parkState**: `object`

Defined in: [lib/working-with-duck-engine.ts:344](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L344)

#### ballVx

> **ballVx**: `number`

#### ballVy

> **ballVy**: `number`

#### ballX

> **ballX**: `number`

#### ballY

> **ballY**: `number`

#### bones

> **bones**: [`ParkBone`](ParkBone.md)[]

#### bonesCollected

> **bonesCollected**: `number`

#### duckAngle

> **duckAngle**: `number`

#### duckVx

> **duckVx**: `number`

#### duckVy

> **duckVy**: `number`

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

Defined in: [lib/working-with-duck-engine.ts:338](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L338)

***

### selectedItem

> **selectedItem**: [`InventoryItem`](../type-aliases/InventoryItem.md)

Defined in: [lib/working-with-duck-engine.ts:326](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L326)

***

### soundCueQueue

> **soundCueQueue**: [`SoundCue`](../type-aliases/SoundCue.md)[]

Defined in: [lib/working-with-duck-engine.ts:366](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L366)

***

### status

> **status**: `"idle"` \| `"paused"` \| `"running"` \| `"failed"` \| `"won"`

Defined in: [lib/working-with-duck-engine.ts:285](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L285)

***

### targetWorkProgress

> **targetWorkProgress**: `number`

Defined in: [lib/working-with-duck-engine.ts:289](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L289)

***

### ticks

> **ticks**: `number`

Defined in: [lib/working-with-duck-engine.ts:294](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L294)

***

### totalScore

> **totalScore**: `number`

Defined in: [lib/working-with-duck-engine.ts:295](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L295)

***

### tutorialStep

> **tutorialStep**: `number`

Defined in: [lib/working-with-duck-engine.ts:367](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L367)

***

### unlockedFacts

> **unlockedFacts**: `number`[]

Defined in: [lib/working-with-duck-engine.ts:362](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L362)

***

### workProgress

> **workProgress**: `number`

Defined in: [lib/working-with-duck-engine.ts:288](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L288)

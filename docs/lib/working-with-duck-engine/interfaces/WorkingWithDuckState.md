[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/working-with-duck-engine](../README.md) / WorkingWithDuckState

# Interface: WorkingWithDuckState

Defined in: [lib/working-with-duck-engine.ts:373](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L373)

## Properties

### activeAccessory

> **activeAccessory**: [`DuckAccessory`](../type-aliases/DuckAccessory.md)

Defined in: [lib/working-with-duck-engine.ts:397](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L397)

***

### activeCodeBursts

> **activeCodeBursts**: `number`

Defined in: [lib/working-with-duck-engine.ts:405](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L405)

***

### activeHazardTarget

> **activeHazardTarget**: [`PortfolioHazardType`](../type-aliases/PortfolioHazardType.md) \| `null`

Defined in: [lib/working-with-duck-engine.ts:445](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L445)

***

### activeSkillToast

> **activeSkillToast**: \{ `badge`: `string`; `text`: `string`; `timer`: `number`; \} \| `null`

Defined in: [lib/working-with-duck-engine.ts:483](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L483)

***

### activeSurpriseEvent

> **activeSurpriseEvent**: \{ `maxTimer`: `number`; `resolved`: `boolean`; `timer`: `number`; `type`: `"amazon-delivery"` \| `"squirrel-window"` \| `"puppy-hiccups"`; \} \| `null`

Defined in: [lib/working-with-duck-engine.ts:410](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L410)

***

### activeTrick

> **activeTrick**: \{ `maxTimer`: `number`; `timer`: `number`; `trick`: [`DuckTrick`](../type-aliases/DuckTrick.md); \} \| `null`

Defined in: [lib/working-with-duck-engine.ts:391](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L391)

***

### ball

> **ball**: \{ `active`: `boolean`; `vx`: `number`; `vy`: `number`; `x`: `number`; `y`: `number`; \} \| `null`

Defined in: [lib/working-with-duck-engine.ts:436](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L436)

***

### bathtubState

> **bathtubState**: [`BathtubState`](BathtubState.md)

Defined in: [lib/working-with-duck-engine.ts:403](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L403)

***

### bellyRubProgress

> **bellyRubProgress**: `number`

Defined in: [lib/working-with-duck-engine.ts:390](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L390)

***

### bellyRubScrubCount

> **bellyRubScrubCount**: `number`

Defined in: [lib/working-with-duck-engine.ts:389](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L389)

***

### bladder

> **bladder**: `number`

Defined in: [lib/working-with-duck-engine.ts:380](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L380)

***

### calmBuffTimer

> **calmBuffTimer**: `number`

Defined in: [lib/working-with-duck-engine.ts:387](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L387)

***

### comboStreak

> **comboStreak**: `number`

Defined in: [lib/working-with-duck-engine.ts:408](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L408)

***

### comboTimer

> **comboTimer**: `number`

Defined in: [lib/working-with-duck-engine.ts:409](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L409)

***

### currentLevel

> **currentLevel**: `number`

Defined in: [lib/working-with-duck-engine.ts:376](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L376)

***

### duck

> **duck**: `object`

Defined in: [lib/working-with-duck-engine.ts:417](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L417)

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

#### tailWagAngle

> **tailWagAngle**: `number`

#### tailWagSpeed

> **tailWagSpeed**: `number`

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

Defined in: [lib/working-with-duck-engine.ts:379](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L379)

***

### floatingAlerts

> **floatingAlerts**: [`FloatingAlert`](FloatingAlert.md)[]

Defined in: [lib/working-with-duck-engine.ts:451](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L451)

***

### hazards

> **hazards**: [`PortfolioHazard`](PortfolioHazard.md)[]

Defined in: [lib/working-with-duck-engine.ts:444](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L444)

***

### highScore

> **highScore**: `number`

Defined in: [lib/working-with-duck-engine.ts:482](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L482)

***

### hunger

> **hunger**: `number`

Defined in: [lib/working-with-duck-engine.ts:382](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L382)

***

### inBathtub

> **inBathtub**: `boolean`

Defined in: [lib/working-with-duck-engine.ts:402](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L402)

***

### inDogPark

> **inDogPark**: `boolean`

Defined in: [lib/working-with-duck-engine.ts:455](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L455)

***

### indoorPuddles

> **indoorPuddles**: [`IndoorPuddle`](IndoorPuddle.md)[]

Defined in: [lib/working-with-duck-engine.ts:447](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L447)

***

### isMuddy

> **isMuddy**: `boolean`

Defined in: [lib/working-with-duck-engine.ts:401](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L401)

***

### lastCodeTick

> **lastCodeTick**: `number`

Defined in: [lib/working-with-duck-engine.ts:406](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L406)

***

### lastImpulseTick

> **lastImpulseTick**: `number`

Defined in: [lib/working-with-duck-engine.ts:388](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L388)

***

### latestUnlockedFact

> **latestUnlockedFact**: [`DuckFact`](DuckFact.md) \| `null`

Defined in: [lib/working-with-duck-engine.ts:481](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L481)

***

### mode

> **mode**: `"campaign"` \| `"endless"`

Defined in: [lib/working-with-duck-engine.ts:375](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L375)

***

### multiplier

> **multiplier**: `number`

Defined in: [lib/working-with-duck-engine.ts:384](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L384)

***

### naughtyVsGood

> **naughtyVsGood**: `number`

Defined in: [lib/working-with-duck-engine.ts:383](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L383)

***

### nextAlertId

> **nextAlertId**: `number`

Defined in: [lib/working-with-duck-engine.ts:453](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L453)

***

### nextParticleId

> **nextParticleId**: `number`

Defined in: [lib/working-with-duck-engine.ts:452](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L452)

***

### nextPuddleId

> **nextPuddleId**: `number`

Defined in: [lib/working-with-duck-engine.ts:448](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L448)

***

### officeStations

> **officeStations**: [`OfficeStations`](OfficeStations.md)

Defined in: [lib/working-with-duck-engine.ts:400](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L400)

***

### parkState

> **parkState**: `object`

Defined in: [lib/working-with-duck-engine.ts:456](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L456)

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

#### duckIsJumping

> **duckIsJumping**: `boolean`

#### duckVx

> **duckVx**: `number`

#### duckVy

> **duckVy**: `number`

#### duckX

> **duckX**: `number`

#### duckY

> **duckY**: `number`

#### friends

> **friends**: [`ParkFriend`](ParkFriend.md)[]

#### hurdles

> **hurdles**: [`ParkHurdle`](ParkHurdle.md)[]

#### hurdlesCleared

> **hurdlesCleared**: `number`

#### jumpHeight

> **jumpHeight**: `number`

#### mode

> **mode**: `"ball"` \| `"frisbee"`

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

Defined in: [lib/working-with-duck-engine.ts:450](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L450)

***

### selectedItem

> **selectedItem**: [`InventoryItem`](../type-aliases/InventoryItem.md)

Defined in: [lib/working-with-duck-engine.ts:435](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L435)

***

### soundCueQueue

> **soundCueQueue**: [`SoundCue`](../type-aliases/SoundCue.md)[]

Defined in: [lib/working-with-duck-engine.ts:484](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L484)

***

### status

> **status**: `"idle"` \| `"paused"` \| `"running"` \| `"failed"` \| `"won"`

Defined in: [lib/working-with-duck-engine.ts:374](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L374)

***

### targetWorkProgress

> **targetWorkProgress**: `number`

Defined in: [lib/working-with-duck-engine.ts:378](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L378)

***

### thirst

> **thirst**: `number`

Defined in: [lib/working-with-duck-engine.ts:381](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L381)

***

### ticks

> **ticks**: `number`

Defined in: [lib/working-with-duck-engine.ts:385](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L385)

***

### totalScore

> **totalScore**: `number`

Defined in: [lib/working-with-duck-engine.ts:386](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L386)

***

### tutorialStep

> **tutorialStep**: `number`

Defined in: [lib/working-with-duck-engine.ts:485](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L485)

***

### unlockedAccessories

> **unlockedAccessories**: [`DuckAccessory`](../type-aliases/DuckAccessory.md)[]

Defined in: [lib/working-with-duck-engine.ts:398](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L398)

***

### unlockedFacts

> **unlockedFacts**: `number`[]

Defined in: [lib/working-with-duck-engine.ts:480](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L480)

***

### workProgress

> **workProgress**: `number`

Defined in: [lib/working-with-duck-engine.ts:377](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L377)

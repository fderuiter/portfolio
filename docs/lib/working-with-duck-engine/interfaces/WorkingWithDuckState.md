[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/working-with-duck-engine](../README.md) / WorkingWithDuckState

# Interface: WorkingWithDuckState

Defined in: [lib/working-with-duck-engine.ts:374](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L374)

## Properties

### activeAccessory

> **activeAccessory**: [`DuckAccessory`](../type-aliases/DuckAccessory.md)

Defined in: [lib/working-with-duck-engine.ts:398](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L398)

***

### activeCodeBursts

> **activeCodeBursts**: `number`

Defined in: [lib/working-with-duck-engine.ts:406](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L406)

***

### activeHazardTarget

> **activeHazardTarget**: [`PortfolioHazardType`](../type-aliases/PortfolioHazardType.md) \| `null`

Defined in: [lib/working-with-duck-engine.ts:446](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L446)

***

### activeSkillToast

> **activeSkillToast**: \{ `badge`: `string`; `text`: `string`; `timer`: `number`; \} \| `null`

Defined in: [lib/working-with-duck-engine.ts:484](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L484)

***

### activeSurpriseEvent

> **activeSurpriseEvent**: \{ `maxTimer`: `number`; `resolved`: `boolean`; `timer`: `number`; `type`: `"amazon-delivery"` \| `"squirrel-window"` \| `"puppy-hiccups"`; \} \| `null`

Defined in: [lib/working-with-duck-engine.ts:411](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L411)

***

### activeTrick

> **activeTrick**: \{ `maxTimer`: `number`; `timer`: `number`; `trick`: [`DuckTrick`](../type-aliases/DuckTrick.md); \} \| `null`

Defined in: [lib/working-with-duck-engine.ts:392](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L392)

***

### ball

> **ball**: \{ `active`: `boolean`; `vx`: `number`; `vy`: `number`; `x`: `number`; `y`: `number`; \} \| `null`

Defined in: [lib/working-with-duck-engine.ts:437](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L437)

***

### bathtubState

> **bathtubState**: [`BathtubState`](BathtubState.md)

Defined in: [lib/working-with-duck-engine.ts:404](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L404)

***

### bellyRubProgress

> **bellyRubProgress**: `number`

Defined in: [lib/working-with-duck-engine.ts:391](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L391)

***

### bellyRubScrubCount

> **bellyRubScrubCount**: `number`

Defined in: [lib/working-with-duck-engine.ts:390](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L390)

***

### bladder

> **bladder**: `number`

Defined in: [lib/working-with-duck-engine.ts:381](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L381)

***

### calmBuffTimer

> **calmBuffTimer**: `number`

Defined in: [lib/working-with-duck-engine.ts:388](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L388)

***

### comboStreak

> **comboStreak**: `number`

Defined in: [lib/working-with-duck-engine.ts:409](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L409)

***

### comboTimer

> **comboTimer**: `number`

Defined in: [lib/working-with-duck-engine.ts:410](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L410)

***

### currentLevel

> **currentLevel**: `number`

Defined in: [lib/working-with-duck-engine.ts:377](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L377)

***

### duck

> **duck**: `object`

Defined in: [lib/working-with-duck-engine.ts:418](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L418)

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

Defined in: [lib/working-with-duck-engine.ts:380](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L380)

***

### floatingAlerts

> **floatingAlerts**: [`FloatingAlert`](FloatingAlert.md)[]

Defined in: [lib/working-with-duck-engine.ts:452](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L452)

***

### hazards

> **hazards**: [`PortfolioHazard`](PortfolioHazard.md)[]

Defined in: [lib/working-with-duck-engine.ts:445](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L445)

***

### highScore

> **highScore**: `number`

Defined in: [lib/working-with-duck-engine.ts:483](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L483)

***

### hunger

> **hunger**: `number`

Defined in: [lib/working-with-duck-engine.ts:383](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L383)

***

### inBathtub

> **inBathtub**: `boolean`

Defined in: [lib/working-with-duck-engine.ts:403](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L403)

***

### inDogPark

> **inDogPark**: `boolean`

Defined in: [lib/working-with-duck-engine.ts:456](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L456)

***

### indoorPuddles

> **indoorPuddles**: [`IndoorPuddle`](IndoorPuddle.md)[]

Defined in: [lib/working-with-duck-engine.ts:448](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L448)

***

### isMuddy

> **isMuddy**: `boolean`

Defined in: [lib/working-with-duck-engine.ts:402](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L402)

***

### lastCodeTick

> **lastCodeTick**: `number`

Defined in: [lib/working-with-duck-engine.ts:407](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L407)

***

### lastImpulseTick

> **lastImpulseTick**: `number`

Defined in: [lib/working-with-duck-engine.ts:389](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L389)

***

### latestUnlockedFact

> **latestUnlockedFact**: [`DuckFact`](DuckFact.md) \| `null`

Defined in: [lib/working-with-duck-engine.ts:482](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L482)

***

### mode

> **mode**: `"campaign"` \| `"endless"`

Defined in: [lib/working-with-duck-engine.ts:376](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L376)

***

### multiplier

> **multiplier**: `number`

Defined in: [lib/working-with-duck-engine.ts:385](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L385)

***

### naughtyVsGood

> **naughtyVsGood**: `number`

Defined in: [lib/working-with-duck-engine.ts:384](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L384)

***

### nextAlertId

> **nextAlertId**: `number`

Defined in: [lib/working-with-duck-engine.ts:454](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L454)

***

### nextParticleId

> **nextParticleId**: `number`

Defined in: [lib/working-with-duck-engine.ts:453](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L453)

***

### nextPuddleId

> **nextPuddleId**: `number`

Defined in: [lib/working-with-duck-engine.ts:449](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L449)

***

### officeStations

> **officeStations**: [`OfficeStations`](OfficeStations.md)

Defined in: [lib/working-with-duck-engine.ts:401](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L401)

***

### parkState

> **parkState**: `object`

Defined in: [lib/working-with-duck-engine.ts:457](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L457)

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

Defined in: [lib/working-with-duck-engine.ts:451](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L451)

***

### selectedItem

> **selectedItem**: [`InventoryItem`](../type-aliases/InventoryItem.md)

Defined in: [lib/working-with-duck-engine.ts:436](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L436)

***

### soundCueQueue

> **soundCueQueue**: [`SoundCue`](../type-aliases/SoundCue.md)[]

Defined in: [lib/working-with-duck-engine.ts:485](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L485)

***

### status

> **status**: `"idle"` \| `"paused"` \| `"running"` \| `"failed"` \| `"won"`

Defined in: [lib/working-with-duck-engine.ts:375](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L375)

***

### targetWorkProgress

> **targetWorkProgress**: `number`

Defined in: [lib/working-with-duck-engine.ts:379](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L379)

***

### thirst

> **thirst**: `number`

Defined in: [lib/working-with-duck-engine.ts:382](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L382)

***

### ticks

> **ticks**: `number`

Defined in: [lib/working-with-duck-engine.ts:386](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L386)

***

### totalScore

> **totalScore**: `number`

Defined in: [lib/working-with-duck-engine.ts:387](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L387)

***

### tutorialStep

> **tutorialStep**: `number`

Defined in: [lib/working-with-duck-engine.ts:486](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L486)

***

### unlockedAccessories

> **unlockedAccessories**: [`DuckAccessory`](../type-aliases/DuckAccessory.md)[]

Defined in: [lib/working-with-duck-engine.ts:399](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L399)

***

### unlockedFacts

> **unlockedFacts**: `number`[]

Defined in: [lib/working-with-duck-engine.ts:481](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L481)

***

### workProgress

> **workProgress**: `number`

Defined in: [lib/working-with-duck-engine.ts:378](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L378)

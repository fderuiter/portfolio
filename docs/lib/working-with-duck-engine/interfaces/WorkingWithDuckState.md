[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/working-with-duck-engine](../README.md) / WorkingWithDuckState

# Interface: WorkingWithDuckState

Defined in: [lib/working-with-duck-engine.ts:404](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L404)

## Properties

### activeAccessory

> **activeAccessory**: [`DuckAccessory`](../type-aliases/DuckAccessory.md)

Defined in: [lib/working-with-duck-engine.ts:428](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L428)

***

### activeCodeBursts

> **activeCodeBursts**: `number`

Defined in: [lib/working-with-duck-engine.ts:436](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L436)

***

### activeHazardTarget

> **activeHazardTarget**: [`PortfolioHazardType`](../type-aliases/PortfolioHazardType.md) \| `null`

Defined in: [lib/working-with-duck-engine.ts:476](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L476)

***

### activeSkillToast

> **activeSkillToast**: \{ `badge`: `string`; `text`: `string`; `timer`: `number`; \} \| `null`

Defined in: [lib/working-with-duck-engine.ts:514](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L514)

***

### activeSurpriseEvent

> **activeSurpriseEvent**: \{ `maxTimer`: `number`; `resolved`: `boolean`; `timer`: `number`; `type`: `"amazon-delivery"` \| `"squirrel-window"` \| `"puppy-hiccups"`; \} \| `null`

Defined in: [lib/working-with-duck-engine.ts:441](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L441)

***

### activeTrick

> **activeTrick**: \{ `maxTimer`: `number`; `timer`: `number`; `trick`: [`DuckTrick`](../type-aliases/DuckTrick.md); \} \| `null`

Defined in: [lib/working-with-duck-engine.ts:422](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L422)

***

### ball

> **ball**: \{ `active`: `boolean`; `vx`: `number`; `vy`: `number`; `x`: `number`; `y`: `number`; \} \| `null`

Defined in: [lib/working-with-duck-engine.ts:467](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L467)

***

### bathtubState

> **bathtubState**: [`BathtubState`](BathtubState.md)

Defined in: [lib/working-with-duck-engine.ts:434](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L434)

***

### bellyRubProgress

> **bellyRubProgress**: `number`

Defined in: [lib/working-with-duck-engine.ts:421](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L421)

***

### bellyRubScrubCount

> **bellyRubScrubCount**: `number`

Defined in: [lib/working-with-duck-engine.ts:420](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L420)

***

### bladder

> **bladder**: `number`

Defined in: [lib/working-with-duck-engine.ts:411](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L411)

***

### calmBuffTimer

> **calmBuffTimer**: `number`

Defined in: [lib/working-with-duck-engine.ts:418](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L418)

***

### comboStreak

> **comboStreak**: `number`

Defined in: [lib/working-with-duck-engine.ts:439](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L439)

***

### comboTimer

> **comboTimer**: `number`

Defined in: [lib/working-with-duck-engine.ts:440](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L440)

***

### currentLevel

> **currentLevel**: `number`

Defined in: [lib/working-with-duck-engine.ts:407](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L407)

***

### duck

> **duck**: `object`

Defined in: [lib/working-with-duck-engine.ts:448](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L448)

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

Defined in: [lib/working-with-duck-engine.ts:410](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L410)

***

### floatingAlerts

> **floatingAlerts**: [`FloatingAlert`](FloatingAlert.md)[]

Defined in: [lib/working-with-duck-engine.ts:482](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L482)

***

### hazards

> **hazards**: [`PortfolioHazard`](PortfolioHazard.md)[]

Defined in: [lib/working-with-duck-engine.ts:475](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L475)

***

### highScore

> **highScore**: `number`

Defined in: [lib/working-with-duck-engine.ts:513](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L513)

***

### hunger

> **hunger**: `number`

Defined in: [lib/working-with-duck-engine.ts:413](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L413)

***

### inBathtub

> **inBathtub**: `boolean`

Defined in: [lib/working-with-duck-engine.ts:433](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L433)

***

### inDogPark

> **inDogPark**: `boolean`

Defined in: [lib/working-with-duck-engine.ts:486](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L486)

***

### indoorPuddles

> **indoorPuddles**: [`IndoorPuddle`](IndoorPuddle.md)[]

Defined in: [lib/working-with-duck-engine.ts:478](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L478)

***

### isMuddy

> **isMuddy**: `boolean`

Defined in: [lib/working-with-duck-engine.ts:432](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L432)

***

### lastCodeTick

> **lastCodeTick**: `number`

Defined in: [lib/working-with-duck-engine.ts:437](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L437)

***

### lastImpulseTick

> **lastImpulseTick**: `number`

Defined in: [lib/working-with-duck-engine.ts:419](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L419)

***

### latestUnlockedFact

> **latestUnlockedFact**: [`DuckFact`](DuckFact.md) \| `null`

Defined in: [lib/working-with-duck-engine.ts:512](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L512)

***

### mode

> **mode**: `"campaign"` \| `"endless"`

Defined in: [lib/working-with-duck-engine.ts:406](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L406)

***

### multiplier

> **multiplier**: `number`

Defined in: [lib/working-with-duck-engine.ts:415](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L415)

***

### naughtyVsGood

> **naughtyVsGood**: `number`

Defined in: [lib/working-with-duck-engine.ts:414](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L414)

***

### nextAlertId

> **nextAlertId**: `number`

Defined in: [lib/working-with-duck-engine.ts:484](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L484)

***

### nextParticleId

> **nextParticleId**: `number`

Defined in: [lib/working-with-duck-engine.ts:483](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L483)

***

### nextPuddleId

> **nextPuddleId**: `number`

Defined in: [lib/working-with-duck-engine.ts:479](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L479)

***

### officeStations

> **officeStations**: [`OfficeStations`](OfficeStations.md)

Defined in: [lib/working-with-duck-engine.ts:431](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L431)

***

### parkState

> **parkState**: `object`

Defined in: [lib/working-with-duck-engine.ts:487](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L487)

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

Defined in: [lib/working-with-duck-engine.ts:481](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L481)

***

### selectedItem

> **selectedItem**: [`InventoryItem`](../type-aliases/InventoryItem.md)

Defined in: [lib/working-with-duck-engine.ts:466](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L466)

***

### soundCueQueue

> **soundCueQueue**: [`SoundCue`](../type-aliases/SoundCue.md)[]

Defined in: [lib/working-with-duck-engine.ts:515](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L515)

***

### status

> **status**: `"idle"` \| `"paused"` \| `"running"` \| `"failed"` \| `"won"`

Defined in: [lib/working-with-duck-engine.ts:405](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L405)

***

### targetWorkProgress

> **targetWorkProgress**: `number`

Defined in: [lib/working-with-duck-engine.ts:409](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L409)

***

### thirst

> **thirst**: `number`

Defined in: [lib/working-with-duck-engine.ts:412](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L412)

***

### ticks

> **ticks**: `number`

Defined in: [lib/working-with-duck-engine.ts:416](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L416)

***

### totalScore

> **totalScore**: `number`

Defined in: [lib/working-with-duck-engine.ts:417](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L417)

***

### tutorialStep

> **tutorialStep**: `number`

Defined in: [lib/working-with-duck-engine.ts:516](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L516)

***

### unlockedAccessories

> **unlockedAccessories**: [`DuckAccessory`](../type-aliases/DuckAccessory.md)[]

Defined in: [lib/working-with-duck-engine.ts:429](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L429)

***

### unlockedFacts

> **unlockedFacts**: `number`[]

Defined in: [lib/working-with-duck-engine.ts:511](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L511)

***

### workProgress

> **workProgress**: `number`

Defined in: [lib/working-with-duck-engine.ts:408](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L408)

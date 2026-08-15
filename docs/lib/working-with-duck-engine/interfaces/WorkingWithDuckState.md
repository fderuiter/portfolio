[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/working-with-duck-engine](../README.md) / WorkingWithDuckState

# Interface: WorkingWithDuckState

Defined in: [lib/working-with-duck-engine.ts:362](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L362)

## Properties

### activeAccessory

> **activeAccessory**: [`DuckAccessory`](../type-aliases/DuckAccessory.md)

Defined in: [lib/working-with-duck-engine.ts:386](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L386)

***

### activeCodeBursts

> **activeCodeBursts**: `number`

Defined in: [lib/working-with-duck-engine.ts:394](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L394)

***

### activeHazardTarget

> **activeHazardTarget**: [`PortfolioHazardType`](../type-aliases/PortfolioHazardType.md) \| `null`

Defined in: [lib/working-with-duck-engine.ts:434](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L434)

***

### activeSkillToast

> **activeSkillToast**: \{ `badge`: `string`; `text`: `string`; `timer`: `number`; \} \| `null`

Defined in: [lib/working-with-duck-engine.ts:469](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L469)

***

### activeSurpriseEvent

> **activeSurpriseEvent**: \{ `maxTimer`: `number`; `resolved`: `boolean`; `timer`: `number`; `type`: `"amazon-delivery"` \| `"squirrel-window"` \| `"puppy-hiccups"`; \} \| `null`

Defined in: [lib/working-with-duck-engine.ts:399](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L399)

***

### activeTrick

> **activeTrick**: \{ `maxTimer`: `number`; `timer`: `number`; `trick`: [`DuckTrick`](../type-aliases/DuckTrick.md); \} \| `null`

Defined in: [lib/working-with-duck-engine.ts:380](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L380)

***

### ball

> **ball**: \{ `active`: `boolean`; `vx`: `number`; `vy`: `number`; `x`: `number`; `y`: `number`; \} \| `null`

Defined in: [lib/working-with-duck-engine.ts:425](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L425)

***

### bathtubState

> **bathtubState**: [`BathtubState`](BathtubState.md)

Defined in: [lib/working-with-duck-engine.ts:392](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L392)

***

### bellyRubProgress

> **bellyRubProgress**: `number`

Defined in: [lib/working-with-duck-engine.ts:379](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L379)

***

### bellyRubScrubCount

> **bellyRubScrubCount**: `number`

Defined in: [lib/working-with-duck-engine.ts:378](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L378)

***

### bladder

> **bladder**: `number`

Defined in: [lib/working-with-duck-engine.ts:369](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L369)

***

### calmBuffTimer

> **calmBuffTimer**: `number`

Defined in: [lib/working-with-duck-engine.ts:376](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L376)

***

### comboStreak

> **comboStreak**: `number`

Defined in: [lib/working-with-duck-engine.ts:397](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L397)

***

### comboTimer

> **comboTimer**: `number`

Defined in: [lib/working-with-duck-engine.ts:398](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L398)

***

### currentLevel

> **currentLevel**: `number`

Defined in: [lib/working-with-duck-engine.ts:365](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L365)

***

### duck

> **duck**: `object`

Defined in: [lib/working-with-duck-engine.ts:406](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L406)

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

Defined in: [lib/working-with-duck-engine.ts:368](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L368)

***

### floatingAlerts

> **floatingAlerts**: [`FloatingAlert`](FloatingAlert.md)[]

Defined in: [lib/working-with-duck-engine.ts:437](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L437)

***

### hazards

> **hazards**: [`PortfolioHazard`](PortfolioHazard.md)[]

Defined in: [lib/working-with-duck-engine.ts:433](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L433)

***

### highScore

> **highScore**: `number`

Defined in: [lib/working-with-duck-engine.ts:468](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L468)

***

### hunger

> **hunger**: `number`

Defined in: [lib/working-with-duck-engine.ts:371](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L371)

***

### inBathtub

> **inBathtub**: `boolean`

Defined in: [lib/working-with-duck-engine.ts:391](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L391)

***

### inDogPark

> **inDogPark**: `boolean`

Defined in: [lib/working-with-duck-engine.ts:441](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L441)

***

### isMuddy

> **isMuddy**: `boolean`

Defined in: [lib/working-with-duck-engine.ts:390](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L390)

***

### lastCodeTick

> **lastCodeTick**: `number`

Defined in: [lib/working-with-duck-engine.ts:395](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L395)

***

### lastImpulseTick

> **lastImpulseTick**: `number`

Defined in: [lib/working-with-duck-engine.ts:377](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L377)

***

### latestUnlockedFact

> **latestUnlockedFact**: [`DuckFact`](DuckFact.md) \| `null`

Defined in: [lib/working-with-duck-engine.ts:467](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L467)

***

### mode

> **mode**: `"campaign"` \| `"endless"`

Defined in: [lib/working-with-duck-engine.ts:364](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L364)

***

### multiplier

> **multiplier**: `number`

Defined in: [lib/working-with-duck-engine.ts:373](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L373)

***

### naughtyVsGood

> **naughtyVsGood**: `number`

Defined in: [lib/working-with-duck-engine.ts:372](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L372)

***

### nextAlertId

> **nextAlertId**: `number`

Defined in: [lib/working-with-duck-engine.ts:439](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L439)

***

### nextParticleId

> **nextParticleId**: `number`

Defined in: [lib/working-with-duck-engine.ts:438](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L438)

***

### officeStations

> **officeStations**: [`OfficeStations`](OfficeStations.md)

Defined in: [lib/working-with-duck-engine.ts:389](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L389)

***

### parkState

> **parkState**: `object`

Defined in: [lib/working-with-duck-engine.ts:442](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L442)

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

Defined in: [lib/working-with-duck-engine.ts:436](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L436)

***

### selectedItem

> **selectedItem**: [`InventoryItem`](../type-aliases/InventoryItem.md)

Defined in: [lib/working-with-duck-engine.ts:424](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L424)

***

### soundCueQueue

> **soundCueQueue**: [`SoundCue`](../type-aliases/SoundCue.md)[]

Defined in: [lib/working-with-duck-engine.ts:470](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L470)

***

### status

> **status**: `"idle"` \| `"paused"` \| `"running"` \| `"failed"` \| `"won"`

Defined in: [lib/working-with-duck-engine.ts:363](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L363)

***

### targetWorkProgress

> **targetWorkProgress**: `number`

Defined in: [lib/working-with-duck-engine.ts:367](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L367)

***

### thirst

> **thirst**: `number`

Defined in: [lib/working-with-duck-engine.ts:370](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L370)

***

### ticks

> **ticks**: `number`

Defined in: [lib/working-with-duck-engine.ts:374](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L374)

***

### totalScore

> **totalScore**: `number`

Defined in: [lib/working-with-duck-engine.ts:375](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L375)

***

### tutorialStep

> **tutorialStep**: `number`

Defined in: [lib/working-with-duck-engine.ts:471](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L471)

***

### unlockedAccessories

> **unlockedAccessories**: [`DuckAccessory`](../type-aliases/DuckAccessory.md)[]

Defined in: [lib/working-with-duck-engine.ts:387](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L387)

***

### unlockedFacts

> **unlockedFacts**: `number`[]

Defined in: [lib/working-with-duck-engine.ts:466](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L466)

***

### workProgress

> **workProgress**: `number`

Defined in: [lib/working-with-duck-engine.ts:366](https://github.com/fderuiter/portfolio/blob/main/lib/working-with-duck-engine.ts#L366)

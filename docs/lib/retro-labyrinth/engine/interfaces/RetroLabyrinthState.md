[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/retro-labyrinth/engine](../README.md) / RetroLabyrinthState

# Interface: RetroLabyrinthState

Defined in: [lib/retro-labyrinth/engine.ts:44](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L44)

## Properties

### activeWeaponId

> **activeWeaponId**: [`WeaponId`](../../../dungeon/types/type-aliases/WeaponId.md)

Defined in: [lib/retro-labyrinth/engine.ts:57](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L57)

***

### campaignRooms

> **campaignRooms**: [`DungeonRoom`](../../../dungeon/types/interfaces/DungeonRoom.md)[]

Defined in: [lib/retro-labyrinth/engine.ts:48](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L48)

***

### crtThemeId

> **crtThemeId**: [`CRTThemeId`](../../../dungeon/types/type-aliases/CRTThemeId.md)

Defined in: [lib/retro-labyrinth/engine.ts:71](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L71)

***

### cryptoCredits

> **cryptoCredits**: `number`

Defined in: [lib/retro-labyrinth/engine.ts:59](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L59)

***

### currentMaze

> **currentMaze**: `string`[][]

Defined in: [lib/retro-labyrinth/engine.ts:49](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L49)

***

### enemies

> **enemies**: [`Enemy`](../../../dungeon/types/interfaces/Enemy.md)[]

Defined in: [lib/retro-labyrinth/engine.ts:63](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L63)

***

### exploredCells

> **exploredCells**: `boolean`[][]

Defined in: [lib/retro-labyrinth/engine.ts:69](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L69)

***

### faceForgeBoss

> **faceForgeBoss**: [`BossState`](../../../dungeon/types/interfaces/BossState.md) \| `null`

Defined in: [lib/retro-labyrinth/engine.ts:62](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L62)

***

### floatingTexts

> **floatingTexts**: [`FloatingNotification`](../../../dungeon/types/interfaces/FloatingNotification.md)[]

Defined in: [lib/retro-labyrinth/engine.ts:66](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L66)

***

### gameMode

> **gameMode**: `"classic"` \| `"roguelike"`

Defined in: [lib/retro-labyrinth/engine.ts:45](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L45)

***

### gameStatus

> **gameStatus**: `"playing"` \| `"victory"` \| `"game_over"`

Defined in: [lib/retro-labyrinth/engine.ts:55](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L55)

***

### hexPuzzle

> **hexPuzzle**: [`HexMatrixPuzzle`](../../../dungeon/types/interfaces/HexMatrixPuzzle.md) \| `null`

Defined in: [lib/retro-labyrinth/engine.ts:70](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L70)

***

### highScore

> **highScore**: `number`

Defined in: [lib/retro-labyrinth/engine.ts:54](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L54)

***

### items

> **items**: [`ItemPickup`](../../../dungeon/types/interfaces/ItemPickup.md)[]

Defined in: [lib/retro-labyrinth/engine.ts:64](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L64)

***

### maxHp

> **maxHp**: `number`

Defined in: [lib/retro-labyrinth/engine.ts:52](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L52)

***

### particles

> **particles**: [`ParticleEffect`](../../../dungeon/types/interfaces/ParticleEffect.md)[]

Defined in: [lib/retro-labyrinth/engine.ts:67](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L67)

***

### playerHp

> **playerHp**: `number`

Defined in: [lib/retro-labyrinth/engine.ts:51](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L51)

***

### playerPosition

> **playerPosition**: `object`

Defined in: [lib/retro-labyrinth/engine.ts:50](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L50)

#### x

> **x**: `number`

#### y

> **y**: `number`

***

### roomIndex

> **roomIndex**: `number`

Defined in: [lib/retro-labyrinth/engine.ts:47](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L47)

***

### score

> **score**: `number`

Defined in: [lib/retro-labyrinth/engine.ts:53](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L53)

***

### selectedClassId

> **selectedClassId**: [`CyberdeckClassId`](../../../dungeon/types/type-aliases/CyberdeckClassId.md)

Defined in: [lib/retro-labyrinth/engine.ts:72](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L72)

***

### selectedWeaponIndex

> **selectedWeaponIndex**: `number`

Defined in: [lib/retro-labyrinth/engine.ts:58](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L58)

***

### sideEffects

> **sideEffects**: [`ActiveSideEffect`](../../../dungeon/types/interfaces/ActiveSideEffect.md)[]

Defined in: [lib/retro-labyrinth/engine.ts:65](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L65)

***

### stage

> **stage**: `number`

Defined in: [lib/retro-labyrinth/engine.ts:46](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L46)

***

### tspTour

> **tspTour**: `object`[]

Defined in: [lib/retro-labyrinth/engine.ts:61](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L61)

#### x

> **x**: `number`

#### y

> **y**: `number`

***

### visibleCells

> **visibleCells**: `boolean`[][]

Defined in: [lib/retro-labyrinth/engine.ts:68](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L68)

***

### visitedNodes

> **visitedNodes**: `object`[]

Defined in: [lib/retro-labyrinth/engine.ts:60](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L60)

#### x

> **x**: `number`

#### y

> **y**: `number`

***

### weapons

> **weapons**: [`Weapon`](../../../dungeon/types/interfaces/Weapon.md)[]

Defined in: [lib/retro-labyrinth/engine.ts:56](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L56)
